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

  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState('');

  const [activeMetric, setActiveMetric] = useState('net'); // 'net', 'cpu', 'ram'
  const [isLiveSystemData, setIsLiveSystemData] = useState(false);
  // Default hardware specifications fallback for production static deployments
  const [systemSpec, setSystemSpec] = useState({
    cpuModel: '13th Gen Intel(R) Core(TM) i5-13420H',
    totalMemGB: 16,
    netName: 'Wi-Fi'
  });
  const [chartData, setChartData] = useState({
    net: Array.from({ length: 20 }, () => Math.floor(30 + Math.random() * 25)),
    cpu: Array.from({ length: 20 }, () => Math.floor(15 + Math.random() * 15)),
    ram: Array.from({ length: 20 }, () => Math.floor(60 + Math.random() * 4))
  });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const metricsConfig = {
    net: {
      name: 'Network Traffic',
      color: '#3b82f6', // blue
      unit: 'Mbps',
      range: '0 - 100 Mbps',
      desc: 'Simulated ingress bandwidth diagnostics.'
    },
    cpu: {
      name: 'CPU Load',
      color: '#ff2b55', // rose
      unit: '%',
      range: '0 - 100%',
      desc: 'System core execution cycles utilization.'
    },
    ram: {
      name: 'RAM Utilization',
      color: '#ff6a3d', // orange-red
      unit: '%',
      range: '0 - 100%',
      desc: 'Allocated memory heap diagnostics.'
    }
  };

  const handlePingTest = () => {
    if (isPinging) return;
    setIsPinging(true);
    setPingResult('');
    setTimeout(() => {
      const simulatedLatency = Math.floor(15 + Math.random() * 45);
      setPingResult(`${simulatedLatency}ms (STABLE)`);
      setIsPinging(false);
    }, 1200);
  };

  // Update chart data in interval
  useEffect(() => {
    const interval = setInterval(async () => {
      let realCpu = null;
      let realRam = null;

      try {
        const res = await fetch('/api/system-diagnostics');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.cpu === 'number') realCpu = data.cpu;
          if (typeof data.ram === 'number') realRam = data.ram;
          if (data.cpuModel && data.totalMemGB) {
            setSystemSpec({
              cpuModel: data.cpuModel,
              totalMemGB: data.totalMemGB,
              netName: data.netName || 'Local Network'
            });
          }
          setIsLiveSystemData(true);
        } else {
          setIsLiveSystemData(false);
        }
      } catch (err) {
        setIsLiveSystemData(false);
      }

      setChartData((prev) => {
        const nextNet = [...prev.net.slice(1)];
        const lastNet = prev.net[prev.net.length - 1];
        const newNet = Math.max(10, Math.min(95, Math.floor(lastNet + (Math.random() - 0.5) * 14)));
        nextNet.push(newNet);

        const nextCpu = [...prev.cpu.slice(1)];
        let newCpu;
        if (realCpu !== null) {
          newCpu = realCpu;
        } else {
          const lastCpu = prev.cpu[prev.cpu.length - 1];
          newCpu = Math.max(5, Math.min(90, Math.floor(lastCpu + (Math.random() - 0.5) * 10)));
        }
        nextCpu.push(newCpu);

        const nextRam = [...prev.ram.slice(1)];
        let newRam;
        if (realRam !== null) {
          newRam = realRam;
        } else {
          const lastRam = prev.ram[prev.ram.length - 1];
          newRam = Math.max(55, Math.min(75, Math.floor(lastRam + (Math.random() - 0.5) * 2)));
        }
        nextRam.push(newRam);

        return { net: nextNet, cpu: nextCpu, ram: nextRam };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);


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

  // SVG Diagnostics Graph calculations
  const currentData = chartData[activeMetric];
  const config = metricsConfig[activeMetric];
  
  const svgWidth = 800;
  const svgHeight = 160;
  const paddingX = 15;
  const paddingY = 20;

  const points = currentData.map((val, i) => {
    const x = paddingX + (i * (svgWidth - 2 * paddingX)) / (currentData.length - 1);
    const y = svgHeight - paddingY - (val * (svgHeight - 2 * paddingY)) / 100;
    return { x, y, val };
  });

  const pathD = `M ${points.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(svgHeight - 5).toFixed(1)} L ${points[0].x.toFixed(1)} ${(svgHeight - 5).toFixed(1)} Z`;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX - paddingX) / (rect.width - 2 * paddingX);
    const index = Math.round(relativeX * (currentData.length - 1));
    const boundedIndex = Math.max(0, Math.min(currentData.length - 1, index));
    setHoveredIndex(boundedIndex);
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

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
              <p className="cyber-title text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Views</p>
              <p className="mt-2.5 flex items-center gap-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                <FiEye className="text-zinc-700 dark:text-zinc-300" />
                <span className="ip-counter">
                  {typeof viewCount === 'number' ? viewCount.toLocaleString() : '--'}
                </span>
              </p>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
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
              <p className="cyber-title text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Current Visitor</p>
              {currentVisitor ? (
                <div className="mt-2 space-y-1.5 text-[12.5px] text-zinc-700 dark:text-zinc-300">
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
                <p className="mt-2 text-[13.5px] text-zinc-500 dark:text-zinc-400">Visitor IP data is not available yet.</p>
              )}
            </div>

            {/* Ping Test Telemetry Tool */}
            <div className="mt-3 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-2.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePingTest}
                  disabled={isPinging}
                  className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-zinc-950 text-white rounded-md border border-zinc-800 hover:bg-zinc-900 disabled:opacity-50 transition-all duration-200"
                >
                  {isPinging ? 'Pinging...' : 'Ping Telemetry'}
                </button>
                {pingResult ? (
                  <p className="text-[12px] font-mono font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {pingResult}
                  </p>
                ) : isPinging ? (
                  <p className="text-[12px] font-mono text-zinc-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                    Calculating...
                  </p>
                ) : (
                  <p className="text-[11px] font-mono text-zinc-400">Idle</p>
                )}
              </div>
            </div>

          </article>

          {/* Card 3: HCMC Local Time & Weather */}
          <article 
            className={`ip-card glass-panel h-full rounded-[1.5rem] p-3.5 flex flex-col justify-between bg-gradient-to-br ${timeGradientClass}`}
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="cyber-title text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">HCMC Time</p>
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
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
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
                <p className="cyber-title text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
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
                  <p className="truncate text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                    {isListening ? activeMedia.song : 'Midnight City'}
                  </p>
                  <p className="truncate text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
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

          {/* Diagnostics Graph (Full-width spans 4 columns on lg) */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-1">
            <article 
              className="ip-card glass-panel rounded-[1.5rem] p-4 flex flex-col justify-between relative overflow-hidden"
              style={{ background: 'var(--surface)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />
              
              {/* Blueprint corner brackets */}
              <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-zinc-400/20 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-zinc-400/20 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-zinc-400/20 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-zinc-400/20 pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="cyber-title text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">System Diagnostics</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                      isLiveSystemData 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {isLiveSystemData ? 'Live Host' : 'Simulated'}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-zinc-800 dark:text-zinc-200 mt-1 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                    {config.name}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5 pl-4 flex items-center gap-1">
                    <span className="opacity-50">//</span>
                    {activeMetric === 'cpu' && `Hardware: ${systemSpec.cpuModel}`}
                    {activeMetric === 'ram' && `Memory Capacity: ${systemSpec.totalMemGB} GB`}
                    {activeMetric === 'net' && `Network Connection: ${systemSpec.netName}`}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10.5px] text-zinc-500 dark:text-zinc-400 hidden sm:inline">{config.range}</span>
                  {/* Tab Switchers */}
                  <div className="flex gap-1">
                    {['net', 'cpu', 'ram'].map((type) => (
                      <button
                        key={type}
                        onClick={() => { setActiveMetric(type); setHoveredIndex(null); }}
                        className={`px-2 py-1 rounded-md text-[10.5px] font-mono uppercase tracking-wider transition-all duration-200 border ${
                          activeMetric === type
                            ? 'bg-zinc-950 text-white border-zinc-850 shadow-md font-bold'
                            : 'bg-black/[0.03] text-zinc-500 border-zinc-200/50 hover:bg-black/[0.06] hover:text-zinc-700 dark:border-zinc-800/30 dark:hover:bg-white/[0.03] dark:hover:text-zinc-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SVG Vector Graph */}
              <div className="relative mt-3 w-full h-[150px] sm:h-[170px]" onMouseLeave={() => setHoveredIndex(null)} onMouseMove={handleMouseMove}>
                <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.color} stopOpacity="0.16" />
                      <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="15" y1="20" x2="785" y2="20" stroke="currentColor" className="text-zinc-200/50 dark:text-zinc-800/30" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="15" y1="60" x2="785" y2="60" stroke="currentColor" className="text-zinc-200/50 dark:text-zinc-800/30" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="15" y1="100" x2="785" y2="100" stroke="currentColor" className="text-zinc-200/50 dark:text-zinc-800/30" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="15" y1="140" x2="785" y2="140" stroke="currentColor" className="text-zinc-200/50 dark:text-zinc-800/30" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Vertical helper lines for points */}
                  {points.map((p, i) => (
                    <line 
                      key={i}
                      x1={p.x} 
                      y1={20} 
                      x2={p.x} 
                      y2={140} 
                      stroke="currentColor" 
                      className="text-zinc-100/30 dark:text-zinc-900/10" 
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* Grid Values */}
                  <text x="15" y="15" className="font-mono text-[9px] fill-zinc-400 dark:fill-zinc-600">100</text>
                  <text x="15" y="55" className="font-mono text-[9px] fill-zinc-400 dark:fill-zinc-600">75</text>
                  <text x="15" y="95" className="font-mono text-[9px] fill-zinc-400 dark:fill-zinc-600">50</text>
                  <text x="15" y="135" className="font-mono text-[9px] fill-zinc-400 dark:fill-zinc-600">25</text>
                  <text x="765" y="15" className="font-mono text-[9px] fill-zinc-400 dark:fill-zinc-600 text-right">{config.unit}</text>

                  {/* Filled Area Under Path */}
                  <path d={areaD} fill="url(#chartAreaGradient)" />

                  {/* Main Spline Line */}
                  <path d={pathD} fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Glowing End Point */}
                  <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={config.color} />
                  <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="7" fill={config.color} className="animate-ping opacity-30" />

                  {/* Interactive hover elements */}
                  {hoveredPoint && (
                    <>
                      <line 
                        x1={hoveredPoint.x} 
                        y1={20} 
                        x2={hoveredPoint.x} 
                        y2={140} 
                        stroke={config.color} 
                        strokeWidth="1" 
                        strokeDasharray="2 2" 
                      />
                      <circle 
                        cx={hoveredPoint.x} 
                        cy={hoveredPoint.y} 
                        r="6" 
                        fill={config.color} 
                        className="animate-ping opacity-60" 
                      />
                      <circle 
                        cx={hoveredPoint.x} 
                        cy={hoveredPoint.y} 
                        r="4" 
                        fill={config.color} 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                      />
                    </>
                  )}
                </svg>

                {/* Tooltip Card */}
                {hoveredPoint && (
                  <div 
                    className="absolute pointer-events-none bg-zinc-950/90 text-white rounded-lg p-2 font-mono text-[10.5px] leading-tight border border-zinc-800 shadow-xl z-20 transition-all duration-75"
                    style={{
                      left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                      top: `${(hoveredPoint.y / svgHeight) * 100 - 15}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="font-bold text-zinc-400">{config.name}</div>
                    <div className="mt-1 text-[12.5px] font-bold text-white">
                      {hoveredPoint.val} {config.unit}
                    </div>
                    <div className="mt-0.5 text-[8.5px] text-zinc-500">
                      T-{20 - hoveredIndex}s ago
                    </div>
                  </div>
                )}
              </div>


            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IpCheckSection;
