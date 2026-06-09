import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { FiClock, FiEye, FiGlobe, FiMapPin, FiWifi, FiSun, FiMoon, FiMusic } from 'react-icons/fi';
import SectionTitle from '../common/SectionTitle';
import { useSiteStatus } from '../../hooks/useSiteStatus';

gsap.registerPlugin(ScrollTrigger);

const isKnownValue = (value) => typeof value === 'string' && value.trim() && value.trim().toLowerCase() !== 'unknown';

const formatLocation = (visitor) => {
  const values = [visitor?.city, visitor?.region, visitor?.country].filter(isKnownValue).map((value) => value.trim());
  return values.length > 0 ? values.join(', ') : 'Location unavailable';
};

const formatSingleValue = (value, fallbackText) => {
  return isKnownValue(value) ? value.trim() : fallbackText;
};

const IpCheckSection = ({ visitorInsights }) => {
  const containerRef = useRef(null);
  const { viewCount, viewSource, currentVisitor, isLoading, errorMessage } = visitorInsights;
  
  const runtimeStatus = useSiteStatus();
  const activeMedia = runtimeStatus.activeMedia;
  const isListening = !!activeMedia;

  const [localTime, setLocalTime] = useState('');
  const [timeState, setTimeState] = useState('day'); // 'day', 'sunset', 'night'
  const [weatherText, setWeatherText] = useState('Sunny, 33°C');


  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Chip
      gsap.from('.ip-chip', {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        y: 16, opacity: 0, duration: 0.5, ease: 'power3.out',
      });

      // Cards stagger
      gsap.from('.ip-card', {
        scrollTrigger: { trigger: '.ip-card', start: 'top 90%', toggleActions: 'play none none none' },
        y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      });

      // Animate view counter
      if (typeof viewCount === 'number' && viewCount > 0) {
        const counter = el.querySelector('.ip-counter');
        if (counter) {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: viewCount,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: { trigger: counter, start: 'top 88%', toggleActions: 'play none none none' },
            snap: { val: 1 },
            onUpdate: () => {
              counter.textContent = Math.round(obj.val).toLocaleString();
            },
          });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [viewCount]);

  // Live Time & Weather calculator (Asia/Ho_Chi_Minh GMT+7)
  useEffect(() => {
    const updateTimeAndWeather = () => {
      const date = new Date();
      // Format HCMC time (24h format hh:mm:ss)
      const timeStr = date.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setLocalTime(timeStr);

      // Get HCMC hour to determine gradient state and weather
      const hcmcHourStr = date.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        hour12: false
      });
      const hour = parseInt(hcmcHourStr, 10) || 12;

      if (hour >= 6 && hour < 16) {
        setTimeState('day');
        setWeatherText('Sunny, 33°C');
      } else if (hour >= 16 && hour < 18) {
        setTimeState('sunset');
        setWeatherText('Golden Hour, 29°C');
      } else {
        setTimeState('night');
        setWeatherText('Clear Night, 25°C');
      }
    };

    updateTimeAndWeather();
    const interval = setInterval(updateTimeAndWeather, 1000);
    return () => clearInterval(interval);
  }, []);

  // Set card gradients depending on time state (with higher opacity mix for text contrast)
  const timeGradientClass = 
    timeState === 'day'
      ? 'from-amber-500/20 via-white/20 to-sky-500/20 border-amber-300/40'
      : timeState === 'sunset'
        ? 'from-rose-500/20 via-white/20 to-amber-500/20 border-rose-300/40'
        : 'from-indigo-950/25 via-white/10 to-slate-900/35 border-indigo-500/20';

  return (
    <section id="ip-check" className="frame-shell" ref={containerRef}>
      <div className="frame-surface flex flex-col items-center justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-4xl">
          <div className="ip-chip story-chip">Telemetry Frame</div>

          <SectionTitle
            kicker="IP Check"
            title="Operational telemetry stays visible without breaking the cinematic flow."
            subtitle="The original visitor logic is unchanged. This frame only reshapes the information into a dashboard-style scene."
            compact
            className="mt-2"
          />

          {errorMessage ? <p className="text-sm text-zinc-500 mt-2">{errorMessage}</p> : null}
        </div>

        <div className="mx-auto mt-3 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {/* Card 1: Views */}
          <article 
            className="ip-card glass-panel h-full rounded-[1.5rem] p-3.5 flex flex-col justify-between"
            style={{ background: 'var(--surface)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div>
              <p className="cyber-title text-[9px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Views</p>
              <p className="mt-2.5 flex items-center gap-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                <FiEye className="text-zinc-700 dark:text-zinc-300" />
                <span className="ip-counter">
                  {typeof viewCount === 'number' ? viewCount.toLocaleString() : '--'}
                </span>
              </p>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {isLoading
                ? 'Loading visitor data...'
                : viewSource === 'global'
                  ? 'Total page views from the global counter.'
                  : 'Local counter fallback for this browser.'}
            </p>
          </article>

          {/* Card 2: Current Visitor & Ping Test */}
          <article 
            className="ip-card glass-panel h-full rounded-[1.5rem] p-3.5 flex flex-col justify-between font-sans"
            style={{ background: 'var(--surface)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div>
              <p className="cyber-title text-[9px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Current Visitor</p>
              {currentVisitor ? (
                <div className="mt-2 space-y-1.5 text-[10.5px] text-zinc-700 dark:text-zinc-300">
                  <p className="flex items-center gap-2 truncate">
                    <FiGlobe className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                    IP: {currentVisitor.ip}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <FiMapPin className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                    {formatLocation(currentVisitor)}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <FiWifi className="shrink-0 text-emerald-600 dark:text-emerald-500" />
                    {formatSingleValue(currentVisitor.provider, 'Provider unavailable')}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <FiClock className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                    {formatSingleValue(currentVisitor.timezone, 'Timezone unavailable')}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Visitor IP data is not available yet.</p>
              )}
            </div>

          </article>

          {/* Card 3: HCMC Local Time & Weather */}
          <article 
            className={`ip-card glass-panel h-full rounded-[1.5rem] p-3.5 flex flex-col justify-between bg-gradient-to-br ${timeGradientClass}`}
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="cyber-title text-[9px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">HCMC Time</p>
                {timeState === 'day' ? (
                  <FiSun className="text-amber-600 dark:text-amber-400 text-xs animate-spin" style={{ animationDuration: '12s' }} />
                ) : timeState === 'sunset' ? (
                  <FiSun className="text-rose-500 text-xs" />
                ) : (
                  <FiMoon className="text-indigo-400 text-xs" />
                )}
              </div>
              <p className="mt-2 font-mono text-xl sm:text-2xl font-light tracking-tight text-zinc-950 dark:text-zinc-50">
                {localTime || '--:--:--'}
              </p>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              {weatherText}
            </p>
          </article>

          {/* Card 4: Spotify / Now Playing */}
          <article 
            className={`ip-card glass-panel h-full rounded-[1.5rem] p-3.5 flex flex-col justify-between ${
              isListening ? 'from-emerald-500/10 via-white/10 to-transparent' : 'from-zinc-500/10 via-white/10 to-transparent'
            } bg-gradient-to-br`}
            style={{ background: 'var(--surface)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <style>{`
              @keyframes soundwave {
                0% { height: 4px; }
                100% { height: 20px; }
              }
            `}</style>
            <div>
              <div className="flex items-center justify-between">
                <p className="cyber-title text-[9px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                  {isListening ? `Playing on ${activeMedia.source}` : 'Last Played'}
                </p>
                <FiMusic className={isListening ? 'text-emerald-600 dark:text-emerald-400 text-[10px] animate-pulse' : 'text-zinc-600 dark:text-zinc-500 text-[10px]'} />
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-black/[0.04] border border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-center">
                  {isListening && activeMedia.albumArtUrl ? (
                    <img 
                      src={activeMedia.albumArtUrl} 
                      alt="Cover Art" 
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-zinc-200/80 to-zinc-50/50 dark:from-zinc-800/80 dark:to-zinc-900/50 flex items-center justify-center">
                      <FiMusic className="text-zinc-500 dark:text-zinc-400 text-xs" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                    {isListening ? activeMedia.song : 'Midnight City'}
                  </p>
                  <p className="truncate text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
                    {isListening ? activeMedia.artist : 'M83'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouncing Audio Wave Visualizer */}
            <div className="mt-2.5 flex items-end justify-center gap-[1.5px] h-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
                const duration = 0.45 + Math.random() * 0.7;
                const delay = Math.random() * 0.45;
                return (
                  <div
                    key={i}
                    className={`w-[1.5px] rounded-full ${isListening ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                    style={{
                      height: isListening ? '4px' : '3px',
                      animation: isListening ? `soundwave ${duration}s ease-in-out ${delay}s infinite alternate` : 'none',
                      willChange: 'height'
                    }}
                  />
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default IpCheckSection;
