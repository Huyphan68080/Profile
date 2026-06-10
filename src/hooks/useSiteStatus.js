import { useEffect, useMemo, useState } from 'react';
import { integrations } from '../data/siteData';

const FALLBACK_IDS = new Set(['', 'YOUR_DISCORD_USER_ID', 'YOUR_DISCORD_ID']);
const DISCORD_STATES = new Set(['online', 'idle', 'dnd', 'offline']);
const MEDIA_SOURCES = ['youtube', 'soundcloud', 'spotify'];
const DISCORD_POLL_INTERVAL_MS = 1800;
const REQUEST_TIMEOUT_MS = 2600;
const SOCKET_RETRY_DELAY_MS = 1200;
const DEFAULT_SOCKET_HEARTBEAT_MS = 30000;
const LANYARD_SOCKET_URL = 'wss://api.lanyard.rest/socket';
const DISCORD_CDN_BASE = 'https://cdn.discordapp.com';

const DISCORD_USER_ID =
  (typeof import.meta !== 'undefined' ? import.meta.env.VITE_DISCORD_USER_ID : '') || integrations.discordUserId || '';

const getBrowserStatus = () => {
  if (typeof window === 'undefined') return 'offline';
  return window.navigator.onLine ? 'online' : 'offline';
};

const getDiscordDefaultAvatarIndex = (userId) => {
  try {
    return Number((BigInt(userId) >> 22n) % 6n);
  } catch {
    return 0;
  }
};

const getDiscordDefaultAvatarUrl = (userId) => {
  if (typeof userId !== 'string' || !userId.trim()) return '';
  return `${DISCORD_CDN_BASE}/embed/avatars/${getDiscordDefaultAvatarIndex(userId)}.png`;
};

const getDiscordAvatarUrl = (discordUser, fallbackUserId = '') => {
  const userId = typeof discordUser?.id === 'string' && discordUser.id ? discordUser.id : fallbackUserId;
  const avatarHash = typeof discordUser?.avatar === 'string' ? discordUser.avatar : '';

  if (userId && avatarHash) {
    const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${DISCORD_CDN_BASE}/avatars/${userId}/${avatarHash}.${extension}?size=512`;
  }

  return getDiscordDefaultAvatarUrl(userId);
};

const getDiscordAvatarDecorationData = (discordUser) => {
  const asset = typeof discordUser?.avatar_decoration_data?.asset === 'string' ? discordUser.avatar_decoration_data.asset : '';
  if (!asset) {
    return {
      avatarDecorationUrl: '',
      avatarDecorationFallbackUrl: '',
    };
  }

  // Discord decoration animations are delivered via APNG in .png on CDN.
  // Keep a webp fallback for edge cases.
  return {
    avatarDecorationUrl: `${DISCORD_CDN_BASE}/avatar-decoration-presets/${asset}.png?size=1024&passthrough=true`,
    avatarDecorationFallbackUrl: `${DISCORD_CDN_BASE}/avatar-decoration-presets/${asset}.webp?size=1024&passthrough=true`,
  };
};

const getInitialDiscordAvatarState = (userId) => {
  const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
  if (!normalizedUserId || FALLBACK_IDS.has(normalizedUserId)) {
    return {
      avatarUrl: '',
      avatarDecorationUrl: '',
      avatarDecorationFallbackUrl: '',
    };
  }

  return {
    avatarUrl: getDiscordDefaultAvatarUrl(normalizedUserId),
    avatarDecorationUrl: '',
    avatarDecorationFallbackUrl: '',
  };
};

const getLanyardUserUrl = (userId) => `https://api.lanyard.rest/v1/users/${userId}?_=${Date.now()}`;

const normalizeTimestamp = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) return null;
  return value < 1e12 ? value * 1000 : value;
};

const getActivityStartTimestamp = (activity) => {
  const start = normalizeTimestamp(activity?.timestamps?.start);
  if (start) return start;

  // Some activities expose only created_at; use it as a fallback for elapsed time.
  return normalizeTimestamp(activity?.created_at);
};

const getActivityEndTimestamp = (activity) => {
  return normalizeTimestamp(activity?.timestamps?.end);
};

const isExpiredActivity = (activity, nowMs = Date.now()) => {
  const endTimestamp = getActivityEndTimestamp(activity);
  if (!endTimestamp) return false;
  return endTimestamp <= nowMs;
};

const getSpotifyStartTimestamp = (spotify) => {
  return normalizeTimestamp(spotify?.timestamps?.start);
};

const formatDuration = (startedAt, nowMs) => {
  if (!startedAt || startedAt > nowMs) return '';

  const totalSeconds = Math.floor((nowMs - startedAt) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) return `${hours}h ${paddedMinutes}m ${paddedSeconds}s`;
  if (minutes > 0) return `${minutes}m ${paddedSeconds}s`;
  return `${seconds}s`;
};

const getActivitySearchText = (activity) => {
  const searchParts = [
    activity?.name,
    activity?.details,
    activity?.state,
    activity?.assets?.large_text,
    activity?.assets?.small_text,
  ];

  return searchParts
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .toLowerCase();
};

const getMediaSource = (activity) => {
  const activityText = getActivitySearchText(activity);
  if (!activityText) return '';
  if (activityText.includes('soundcloud')) return 'SoundCloud';
  if (activityText.includes('youtube')) return 'YouTube';
  if (activityText.includes('spotify')) return 'Spotify';
  return '';
};

const isMediaActivity = (activity) => MEDIA_SOURCES.some((source) => getActivitySearchText(activity).includes(source));

const cleanMediaField = (value, sourceName) => {
  if (typeof value !== 'string') return '';

  const sourcePattern = new RegExp(`^${sourceName}\\s*[-:]\\s*`, 'i');
  return value
    .replace(/^(listening|playing|watching)\s*[:\-]\s*/i, '')
    .replace(sourcePattern, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatMediaLabel = (sourceName, activity) => {
  const title = cleanMediaField(activity?.details?.trim() || activity?.assets?.large_text?.trim(), sourceName);
  const subtitle = cleanMediaField(activity?.state?.trim() || activity?.assets?.small_text?.trim(), sourceName);

  if (title) return `${sourceName}: ${title}`;
  if (subtitle) return `${sourceName}: ${subtitle}`;
  return `${sourceName}: Active`;
};

const getSpotifyLabel = (spotify) => {
  const song = spotify?.song?.trim();
  const artist = spotify?.artist?.trim();
  if (!song && !artist) return '';
  if (song && artist) return `Spotify: ${song} - ${artist}`;
  if (song) return `Spotify: ${song}`;
  return `Spotify: ${artist}`;
};

const getCustomStatusLabel = (activities) => {
  const customActivity = activities.find((activity) => activity?.type === 4);
  if (!customActivity) return '';

  const emojiStr = customActivity.emoji?.name ? `${customActivity.emoji.name} ` : '';
  const textStr = customActivity.state?.trim() || '';

  return (emojiStr + textStr).trim();
};

const getGenericActivityLabel = (activity) => {
  const appName = typeof activity?.name === 'string' ? activity.name.trim() : '';
  const details = typeof activity?.details === 'string' ? activity.details.trim() : '';
  const state = typeof activity?.state === 'string' ? activity.state.trim() : '';
  const mainText = appName || details || state;

  if (activity?.type === 0) return `Game: ${mainText || 'Active'}`;
  if (activity?.type === 1) return `Streaming: ${mainText || 'Active'}`;
  if (appName && details && details.toLowerCase() !== appName.toLowerCase()) {
    return `App: ${appName} - ${details}`;
  }
  return `App: ${mainText || 'Active'}`;
};

const createActivityEntry = (activity) => {
  if (!activity || typeof activity !== 'object') return null;

  const mediaSource = getMediaSource(activity);
  const label = mediaSource ? formatMediaLabel(mediaSource, activity) : getGenericActivityLabel(activity);
  const durationStartedAt = getActivityStartTimestamp(activity);

  if (!label) return null;
  return {
    id: `${activity.id || activity.name || 'activity'}-${durationStartedAt || 'na'}`,
    label,
    isMedia: Boolean(mediaSource),
    durationStartedAt,
  };
};

const extractPresenceMeta = (presenceData) => {
  const activities = Array.isArray(presenceData?.activities) ? presenceData.activities : [];
  const richActivities = activities.filter((activity) => activity?.type !== 4 && !isExpiredActivity(activity));

  const activityEntries = [];
  for (const activity of richActivities) {
    const entry = createActivityEntry(activity);
    if (entry) {
      activityEntries.push(entry);
    }
  }

  if (presenceData?.listening_to_spotify) {
    const spotifyLabel = getSpotifyLabel(presenceData?.spotify);
    const alreadyHasSpotify = activityEntries.some((entry) => entry.label.toLowerCase().startsWith('spotify:'));

    if (spotifyLabel && !alreadyHasSpotify) {
      activityEntries.push({
        id: 'spotify-fallback',
        label: spotifyLabel,
        isMedia: true,
        durationStartedAt: getSpotifyStartTimestamp(presenceData?.spotify),
      });
    }
  }

  return {
    activityEntries,
    customLabel: getCustomStatusLabel(activities),
  };
};

const isPresenceObject = (value) => {
  return typeof value === 'object' && value !== null && typeof value.discord_status === 'string';
};

const getSocketPresenceData = (message, targetUserId) => {
  const eventType = typeof message?.t === 'string' ? message.t : '';
  if (eventType !== 'INIT_STATE' && eventType !== 'PRESENCE_UPDATE') return null;
  if (message?.op !== 0) return null;

  const data = message?.d;
  if (!data || typeof data !== 'object') return null;

  // Single subscription can return a direct presence object.
  if (isPresenceObject(data)) {
    if (eventType !== 'PRESENCE_UPDATE') return data;
    if (typeof data.user_id === 'string' && data.user_id !== targetUserId) return null;
    return data;
  }

  // INIT_STATE may also return a { [userId]: presence } map.
  const mappedPresence = data[targetUserId];
  if (isPresenceObject(mappedPresence)) return mappedPresence;

  return null;
};

const getActiveMediaStatus = (presenceData) => {
  if (!presenceData) return null;
  
  // 1. Spotify direct listener
  if (presenceData.listening_to_spotify && presenceData.spotify) {
    return {
      song: presenceData.spotify.song,
      artist: presenceData.spotify.artist,
      source: 'Spotify',
      albumArtUrl: presenceData.spotify.album_art_url,
    };
  }

  // 2. Discord activities of type 2 (Media Listening)
  const activities = Array.isArray(presenceData.activities) ? presenceData.activities : [];
  const media = activities.find((act) => act.type === 2);
  if (media) {
    let albumArtUrl = null;
    const largeImage = media.assets?.large_image;
    if (largeImage) {
      if (largeImage.startsWith('mp:external/')) {
        const parts = largeImage.split('/https/');
        if (parts[1]) {
          albumArtUrl = 'https://' + parts[1];
        }
      } else if (media.application_id) {
        albumArtUrl = `https://cdn.discordapp.com/app-assets/${media.application_id}/${largeImage}.png`;
      }
    }

    return {
      song: media.details || media.name || 'Active Track',
      artist: media.state || 'Unknown Artist',
      source: media.name || 'Music',
      albumArtUrl: albumArtUrl,
    };
  }

  return null;
};

export const useSiteStatus = () => {
  const [state, setState] = useState({
    availability: getBrowserStatus(),
    source: 'browser',
    activityEntries: [],
    customLabel: '',
    activeMedia: null,
    ...getInitialDiscordAvatarState(DISCORD_USER_ID),
  });
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const normalizedId = DISCORD_USER_ID.trim();
    const canUseDiscord = !FALLBACK_IDS.has(normalizedId);

    if (!canUseDiscord) {
      const syncBrowserStatus = () =>
        setState((prev) => ({
          ...prev,
          availability: getBrowserStatus(),
          source: 'browser',
          activityEntries: [],
          customLabel: '',
        }));

      window.addEventListener('online', syncBrowserStatus);
      window.addEventListener('offline', syncBrowserStatus);

      return () => {
        window.removeEventListener('online', syncBrowserStatus);
        window.removeEventListener('offline', syncBrowserStatus);
      };
    }

    let isMounted = true;
    let intervalId;
    let reconnectTimeoutId;
    let heartbeatIntervalId;
    let socket;
    let stopPolling = () => {};
    let stopSocket = () => {};
    let isSyncing = false;

    const applyDiscordPresence = (presenceData) => {
      const discordStatus = presenceData?.discord_status;
      if (typeof discordStatus !== 'string' || !DISCORD_STATES.has(discordStatus)) {
        throw new Error('Invalid Lanyard payload');
      }

      const shouldShowActivities = discordStatus === 'online' || discordStatus === 'idle' || discordStatus === 'dnd';
      const { activityEntries, customLabel } = shouldShowActivities
        ? extractPresenceMeta(presenceData)
        : {
            activityEntries: [],
            customLabel: '',
          };

      const avatarUrl = getDiscordAvatarUrl(presenceData?.discord_user, normalizedId);
      const { avatarDecorationUrl, avatarDecorationFallbackUrl } = getDiscordAvatarDecorationData(presenceData?.discord_user);

      const activeMedia = getActiveMediaStatus(presenceData);

      if (!isMounted) return;
      setState({
        availability: discordStatus,
        source: 'discord',
        activityEntries,
        customLabel,
        avatarUrl,
        avatarDecorationUrl,
        avatarDecorationFallbackUrl,
        activeMedia,
      });
    };

    const clearReconnectTimeout = () => {
      if (reconnectTimeoutId) {
        window.clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = undefined;
      }
    };

    const clearHeartbeatInterval = () => {
      if (heartbeatIntervalId) {
        window.clearInterval(heartbeatIntervalId);
        heartbeatIntervalId = undefined;
      }
    };

    const sendSocketPayload = (payload) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify(payload));
    };

    function scheduleSocketReconnect() {
      if (!isMounted || reconnectTimeoutId) return;

      reconnectTimeoutId = window.setTimeout(() => {
        reconnectTimeoutId = undefined;
        connectSocket();
        syncDiscordStatus();
      }, SOCKET_RETRY_DELAY_MS);
    }

    function handleSocketMessage(rawMessage) {
      let message;
      try {
        message = JSON.parse(rawMessage);
      } catch {
        return;
      }

      if (message?.op === 1) {
        const heartbeatMs =
          typeof message?.d?.heartbeat_interval === 'number' && message.d.heartbeat_interval > 1000
            ? message.d.heartbeat_interval
            : DEFAULT_SOCKET_HEARTBEAT_MS;

        sendSocketPayload({
          op: 2,
          d: { subscribe_to_id: normalizedId },
        });

        clearHeartbeatInterval();
        heartbeatIntervalId = window.setInterval(() => {
          sendSocketPayload({ op: 3 });
        }, heartbeatMs);
        return;
      }

      const presenceData = getSocketPresenceData(message, normalizedId);
      if (!presenceData) return;

      try {
        applyDiscordPresence(presenceData);
      } catch {
        // Ignore malformed socket packets; polling fallback will recover state.
      }
    }

    function connectSocket() {
      if (!isMounted || socket || typeof window === 'undefined' || typeof window.WebSocket === 'undefined') return;

      try {
        socket = new window.WebSocket(LANYARD_SOCKET_URL);
      } catch {
        scheduleSocketReconnect();
        return;
      }

      socket.onopen = () => {
        clearReconnectTimeout();
        syncDiscordStatus();
      };

      socket.onmessage = (event) => {
        handleSocketMessage(event.data);
      };

      socket.onerror = () => {};

      socket.onclose = () => {
        clearHeartbeatInterval();
        socket = undefined;
        scheduleSocketReconnect();
      };
    }

    const teardownSocket = () => {
      clearReconnectTimeout();
      clearHeartbeatInterval();

      if (!socket) return;
      const activeSocket = socket;

      if (activeSocket.readyState === WebSocket.CONNECTING) {
        // In React dev strict mode, cleanup can run before WS handshake finishes.
        // Closing a CONNECTING socket logs noisy browser warnings.
        activeSocket.onmessage = null;
        activeSocket.onerror = null;
        activeSocket.onclose = null;
        activeSocket.onopen = () => {
          activeSocket.close();
        };
      } else {
        activeSocket.onopen = null;
        activeSocket.onmessage = null;
        activeSocket.onerror = null;
        activeSocket.onclose = null;

        if (activeSocket.readyState === WebSocket.OPEN) {
          activeSocket.close();
        }
      }
      socket = undefined;
    };

    const syncDiscordStatus = async () => {
      if (isSyncing) return;
      isSyncing = true;

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(getLanyardUserUrl(normalizedId), {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (response.status === 404) {
          if (!isMounted) return;
          setState((prev) => ({
            ...prev,
            availability: 'not_linked',
            source: 'discord',
            activityEntries: [],
            customLabel: '',
          }));
          stopPolling();
          stopSocket();
          return;
        }

        if (!response.ok) {
          throw new Error(`Lanyard status ${response.status}`);
        }

        const payload = await response.json();
        applyDiscordPresence(payload?.data);
      } catch {
        if (!isMounted) return;
        setState((prev) => ({
          ...prev,
          availability: window.navigator.onLine ? 'unavailable' : 'offline',
          source: 'discord',
          activityEntries: [],
          customLabel: '',
        }));
      } finally {
        window.clearTimeout(timeoutId);
        isSyncing = false;
      }
    };

    stopPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    stopSocket = () => {
      teardownSocket();
    };

    syncDiscordStatus();
    connectSocket();
    intervalId = window.setInterval(syncDiscordStatus, DISCORD_POLL_INTERVAL_MS);
    const handleWindowFocus = () => syncDiscordStatus();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncDiscordStatus();
      }
    };
    const handleConnectionChange = () => syncDiscordStatus();

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      isMounted = false;
      stopPolling();
      stopSocket();
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  return useMemo(() => {
    const activityLines = state.activityEntries.map((entry) => {
      const duration = formatDuration(entry.durationStartedAt, nowMs);
      return {
        ...entry,
        duration,
      };
    });

    if (state.source === 'browser') {
      const browserOnline = state.availability === 'online';
      return {
        label: browserOnline ? 'Owner Online' : 'Owner Offline',
        toneClass: browserOnline ? 'text-emerald-900 font-bold' : 'text-zinc-800 font-bold',
        dotClass: browserOnline ? 'bg-emerald-500 ring-1 ring-emerald-600/30 shadow-[0_0_4px_rgba(16,185,129,0.4)]' : 'bg-zinc-400 ring-1 ring-zinc-500/20 shadow-[0_0_2px_rgba(156,163,175,0.2)]',
        activityLines: [],
        customLabel: '',
        avatarUrl: state.avatarUrl,
        avatarDecorationUrl: state.avatarDecorationUrl,
        avatarDecorationFallbackUrl: state.avatarDecorationFallbackUrl,
        activeMedia: null,
      };
    }

    if (state.availability === 'online') {
      return {
        label: 'Owner Online (Discord)',
        toneClass: 'text-emerald-900 font-bold',
        dotClass: 'bg-[#23a55a] ring-1 ring-[#1f8b4c]/30 shadow-[0_0_4px_rgba(35,165,90,0.4)]',
        activityLines,
        customLabel: state.customLabel,
        avatarUrl: state.avatarUrl,
        avatarDecorationUrl: state.avatarDecorationUrl,
        avatarDecorationFallbackUrl: state.avatarDecorationFallbackUrl,
        activeMedia: state.activeMedia,
      };
    }

    if (state.availability === 'idle') {
      return {
        label: 'Owner Idle (Discord)',
        toneClass: 'text-amber-900 font-bold',
        dotClass: 'bg-[#f0b232] ring-1 ring-[#d97706]/40 shadow-[0_0_4px_rgba(240,178,50,0.5)]',
        activityLines,
        customLabel: state.customLabel,
        avatarUrl: state.avatarUrl,
        avatarDecorationUrl: state.avatarDecorationUrl,
        avatarDecorationFallbackUrl: state.avatarDecorationFallbackUrl,
        activeMedia: state.activeMedia,
      };
    }

    if (state.availability === 'dnd') {
      return {
        label: 'Owner Do Not Disturb',
        toneClass: 'text-rose-900 font-bold',
        dotClass: 'bg-[#f23f43] ring-1 ring-[#b91c1c]/25 shadow-[0_0_4px_rgba(242,63,67,0.4)]',
        activityLines,
        customLabel: state.customLabel,
        avatarUrl: state.avatarUrl,
        avatarDecorationUrl: state.avatarDecorationUrl,
        avatarDecorationFallbackUrl: state.avatarDecorationFallbackUrl,
        activeMedia: state.activeMedia,
      };
    }

    if (state.availability === 'offline') {
      return {
        label: 'Owner Offline (Discord)',
        toneClass: 'text-zinc-800 font-bold',
        dotClass: 'bg-[#80848e] ring-1 ring-zinc-500/20 shadow-[0_0_2px_rgba(128,132,142,0.2)]',
        activityLines: [],
        customLabel: '',
        avatarUrl: state.avatarUrl,
        avatarDecorationUrl: state.avatarDecorationUrl,
        avatarDecorationFallbackUrl: state.avatarDecorationFallbackUrl,
        activeMedia: null,
      };
    }

    if (state.availability === 'not_linked') {
      return {
        label: 'Lanyard Not Linked',
        toneClass: 'text-zinc-800 font-bold',
        dotClass: 'bg-[#80848e] ring-1 ring-zinc-500/20 shadow-[0_0_2px_rgba(128,132,142,0.2)]',
        activityLines: [],
        customLabel: '',
        avatarUrl: state.avatarUrl,
        avatarDecorationUrl: state.avatarDecorationUrl,
        avatarDecorationFallbackUrl: state.avatarDecorationFallbackUrl,
        activeMedia: null,
      };
    }

    return {
      label: 'Discord Unavailable',
      toneClass: 'text-zinc-800 font-bold',
      dotClass: 'bg-[#80848e] ring-1 ring-zinc-500/20 shadow-[0_0_2px_rgba(128,132,142,0.2)]',
      activityLines: [],
      customLabel: '',
      avatarUrl: state.avatarUrl,
      avatarDecorationUrl: state.avatarDecorationUrl,
      avatarDecorationFallbackUrl: state.avatarDecorationFallbackUrl,
      activeMedia: null,
    };
  }, [
    state.availability,
    state.source,
    state.activityEntries,
    state.customLabel,
    state.avatarUrl,
    state.avatarDecorationUrl,
    state.avatarDecorationFallbackUrl,
    nowMs,
  ]);
};
