import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { profile } from '../../data/siteData';
import { useLoopTypewriter } from '../../hooks/useLoopTypewriter';
import { useSiteStatus } from '../../hooks/useSiteStatus';
import { useTypewriter } from '../../hooks/useTypewriter';
import RippleButton from '../common/RippleButton';

gsap.registerPlugin(ScrollTrigger);

const heroSignals = [
  'Distributed system architectures',
  'Scalable data infrastructures',
  'Premium spatial interfaces'
];

const HeroSection = ({ isLoading = false }) => {
  const containerRef = useRef(null);
  const avatarRef = useRef(null);
  const typedText = useTypewriter(profile.typewriterText, 40, 620);
  const runtimeStatus = useSiteStatus();
  const [decorationIndex, setDecorationIndex] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const loopingName = useLoopTypewriter(profile.name.toUpperCase(), {
    typeSpeed: 170,
    deleteSpeed: 95,
    pauseBeforeDelete: 1050,
    pauseBeforeType: 320,
  });

  const decorationCandidates = useMemo(
    () => [runtimeStatus.avatarDecorationUrl, runtimeStatus.avatarDecorationFallbackUrl].filter(Boolean),
    [runtimeStatus.avatarDecorationUrl, runtimeStatus.avatarDecorationFallbackUrl]
  );
  const activeDecorationSrc = decorationCandidates[decorationIndex] || '';

  useEffect(() => {
    setDecorationIndex(0);
  }, [runtimeStatus.avatarDecorationUrl, runtimeStatus.avatarDecorationFallbackUrl]);

  // Mouse tracking for 3D scene
  useEffect(() => {
    const handler = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('pointermove', handler, { passive: true });
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  // GSAP timeline animation for hero content
  useEffect(() => {
    if (isLoading) return;
    
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-chip', { y: 16, opacity: 0, duration: 0.5 }, 0.1)
        .from('.hero-kicker', { y: 12, opacity: 0, duration: 0.5 }, 0.2)
        .from('.hero-name-char', { y: 28, opacity: 0, duration: 0.6, stagger: 0.03 }, 0.3)
        .from('.hero-role', { y: 16, opacity: 0, duration: 0.5 }, 0.55)
        .from('.hero-typewriter', { y: 14, opacity: 0, duration: 0.5 }, 0.65)
        .from('.hero-headline', { y: 14, opacity: 0, duration: 0.5 }, 0.75)
        .from('.hero-cta', { y: 16, opacity: 0, duration: 0.5 }, 0.85)
        .from('.hero-signal', { y: 18, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.95)
        .from('.hero-card', { y: 22, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.4);
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  // Avatar 3D tilt
  const handleAvatarMouseMove = useCallback((e) => {
    const el = avatarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    setTilt({ rx: -py * 12, ry: px * 12 });
  }, []);

  const handleAvatarMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
  }, []);

  const nameChars = (loopingName || '\u00A0').split('').map((char, i) => (
    <span key={i} className="hero-name-char inline-block">{char === ' ' ? '\u00A0' : char}</span>
  ));

  return (
    <section id="hero" className="frame-shell relative" ref={containerRef}>
      <div className="frame-surface flex flex-col justify-center overflow-hidden">
        <div className="grid h-full w-full grid-cols-1 md:grid-cols-12 gap-3 xl:gap-4 items-stretch">
          
          {/* Left Column (Dominant Hero Card) */}
          <div className="glass-panel rounded-[1.2rem] md:col-span-8 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />
            <div className="absolute -right-10 top-0 h-20 w-20 rounded-full bg-zinc-500/5 blur-xl" />

            <div>
              <div className="hero-chip story-chip">Landing Frame</div>

              <div className="mt-2 max-w-3xl sm:mt-3">
                <p className="hero-kicker cyber-title text-[9px] sm:text-[10px] uppercase tracking-[0.34em] text-zinc-500">{profile.kicker}</p>

                <h1 className="mt-1.5 text-[1.85rem] font-black tracking-tighter leading-[0.98] text-zinc-900 sm:text-3xl lg:text-[3.2rem]">
                  <span className="inline-flex items-center">
                    <span>{nameChars}</span>
                    <span className="ml-2 inline-block h-[0.95em] w-[2px] animate-pulse bg-zinc-900" />
                  </span>
                  <span className="hero-role mt-1 block bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-600 bg-clip-text text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-transparent sm:mt-1.5 sm:text-[1.1rem] sm:tracking-[0.28em]">
                    {profile.role}
                  </span>
                </h1>

                <div className="hero-typewriter mt-2 inline-flex max-w-full items-center rounded-full border border-zinc-300/60 bg-black/[0.02] px-2.5 py-1 text-[11px] text-zinc-800 sm:mt-3 sm:px-3.5 sm:py-1.5 sm:text-xs">
                  <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                  {typedText}
                  <span className="ml-1 inline-block w-3 animate-pulse">|</span>
                </div>

                <p className="hero-headline mt-2.5 max-w-2xl text-[11.5px] leading-relaxed text-zinc-700 sm:mt-3.5 sm:text-[12.5px]">
                  {profile.headline}
                </p>
              </div>
            </div>

            <div>
              <div className="hero-cta mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2.5">
                <RippleButton
                  href="#projects"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white border border-transparent text-[10px] uppercase tracking-[0.22em]"
                >
                  Explore Projects
                </RippleButton>
                <RippleButton
                  href="#contact"
                  className="border-zinc-200 bg-black/[0.03] text-[10px] uppercase tracking-[0.22em] text-zinc-800"
                >
                  Start A Project
                </RippleButton>
              </div>

              <div className="mt-3.5 hidden gap-2.5 sm:grid sm:grid-cols-3 lg:mt-4.5">
                {heroSignals.map((signal, index) => (
                  <div key={signal} className="hero-signal glass-panel rounded-xl border border-zinc-200/60 px-3 py-2.5">
                    <p className="cyber-title text-[9px] uppercase tracking-[0.28em] text-zinc-500">
                      Signal {index + 1}
                    </p>
                    <p className="mt-1 text-[11px] leading-normal text-zinc-700">{signal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Identity / Presence Bento Stack) */}
          <div className="md:col-span-4 flex flex-col gap-3 h-full justify-between">
            
            {/* Identity Card */}
            <div className="hero-card glass-panel relative overflow-hidden rounded-[1.2rem] border border-zinc-200 p-3.5 sm:p-4 flex-1 flex flex-col justify-center" style={{ background: 'rgba(255, 255, 255, 0.20)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />
              <div className="absolute -left-6 top-6 h-14 w-14 rounded-full bg-zinc-500/5 blur-xl" />

              <div className="grid gap-3 lg:grid-cols-[auto_1fr] lg:items-center">
                <div
                  ref={avatarRef}
                  className="relative mx-auto aspect-square w-full max-w-[95px] lg:max-w-[105px]"
                  onMouseMove={handleAvatarMouseMove}
                  onMouseLeave={handleAvatarMouseLeave}
                  style={{ perspective: '600px' }}
                >
                  <div
                    className="relative h-full w-full transition-transform duration-200 ease-out"
                    style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-400/10 via-zinc-600/5 to-transparent blur-lg" />
                    <div className="relative h-full w-full overflow-hidden rounded-full border border-zinc-200 bg-zinc-900/70">
                      {runtimeStatus.avatarUrl ? (
                        <img src={runtimeStatus.avatarUrl} alt="Discord Avatar" className="block h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-zinc-900/70" />
                      )}
                    </div>
                    {activeDecorationSrc ? (
                      <img
                        src={activeDecorationSrc}
                        alt=""
                        aria-hidden="true"
                        onError={() => setDecorationIndex((prev) => prev + 1)}
                        className="pointer-events-none absolute -inset-[12%] z-10 h-[124%] w-[124%] max-w-none object-contain"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2 text-center lg:text-left">
                  <div>
                    <p className="cyber-title text-[9px] uppercase tracking-[0.3em] text-zinc-500">Realtime Identity</p>
                    <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-zinc-900">{profile.name}</h2>
                  </div>

                  <div className="grid gap-1.5 grid-cols-2">
                    <div className="rounded-xl border border-zinc-200/80 bg-black/[0.08] p-2">
                      <p className="cyber-title text-[8.5px] uppercase tracking-[0.22em] text-zinc-600">Status</p>
                      <p className={`mt-0.5 flex items-center justify-center lg:justify-start gap-1.5 text-xs leading-snug ${runtimeStatus.toneClass}`}>
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${runtimeStatus.dotClass}`} />
                        {runtimeStatus.label}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200/80 bg-black/[0.08] p-2">
                      <p className="cyber-title text-[8.5px] uppercase tracking-[0.22em] text-zinc-600">Focus</p>
                      <p className="mt-0.5 text-xs font-semibold leading-snug text-zinc-800">Motion UI.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Presence Card */}
            <div className="hero-card glass-panel rounded-[1.2rem] border border-zinc-200 p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="cyber-title text-[9px] uppercase tracking-[0.22em] text-zinc-500">Live Presence</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Current activity snapshot.
                </p>
              </div>

              <div className="mt-2 flex-1 flex flex-col justify-center">
                {runtimeStatus.activityLines?.length > 0 ? (
                  <div data-lenis-prevent className="max-h-20 space-y-1 overflow-y-auto pr-1">
                    {runtimeStatus.activityLines.map((item) => (
                      <p
                        key={item.id}
                        className={`break-words text-[10.5px] leading-snug ${item.isMedia ? 'text-zinc-900 font-medium' : 'text-zinc-700'}`}
                      >
                        {item.label}
                        {item.duration ? <span className="ml-1 text-emerald-600">({item.duration})</span> : null}
                      </p>
                    ))}
                  </div>
                ) : runtimeStatus.customLabel ? (
                  <p className="break-words text-[10.5px] italic text-zinc-500">{runtimeStatus.customLabel}</p>
                ) : (
                  <p className="text-[10.5px] text-zinc-500">No active session detected.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
