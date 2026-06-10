import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const roadmapItems = [
  {
    name: 'Telemetry Websocket',
    desc: 'Real-time site visitor analytics and Discord active status parser pipeline.',
    status: 'Released',
    progress: 100,
    badgeColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    name: 'Gateway Rate Limiter',
    desc: 'API proxy rate limiting and sliding window token bucket middleware.',
    status: 'In Dev',
    progress: 70,
    badgeColor: 'text-amber-600 bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'WebGL Shader Engine',
    desc: 'Custom fragment shader background builder utilizing GPU raymarching.',
    status: 'Planning',
    progress: 20,
    badgeColor: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/20'
  }
];

const ProjectRoadmap = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      el.querySelectorAll('.roadmap-bar').forEach((bar) => {
        const lvl = bar.dataset.level;
        gsap.to(bar, {
          scrollTrigger: { trigger: bar, start: 'top 92%', toggleActions: 'play none none none' },
          width: `${lvl}%`,
          duration: 1.2,
          ease: 'power2.out',
          delay: 0.1
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <article 
      ref={containerRef}
      className="group/roadmap glass-panel h-full rounded-[1.4rem] border border-zinc-200/60 p-4 sm:p-5 relative bg-white/[0.60] dark:bg-white/[0.08] hover:bg-white/[0.68] dark:hover:bg-white/[0.12] hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between"
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      {/* Corner decorative blueprint brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-300 dark:border-zinc-700 opacity-60 group-hover/roadmap:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-300 dark:border-zinc-700 opacity-60 group-hover/roadmap:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-300 dark:border-zinc-700 opacity-60 group-hover/roadmap:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-300 dark:border-zinc-700 opacity-60 group-hover/roadmap:opacity-100 transition-opacity duration-300" />

      {/* Shimmer sheen */}
      <div className="absolute inset-0 -translate-x-full group-hover/roadmap:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2 mb-3.5">
          <h3 className="cyber-title text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400 font-extrabold">System Roadmap</h3>
          <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">[ FUTURISTIC_2026 ]</span>
        </div>

        {/* Roadmap Items */}
        <div className="space-y-3.5">
          {roadmapItems.map((item) => (
            <div key={item.name} className="relative flex flex-col">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[15.5px] sm:text-[16px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                  {item.name}
                </span>
                <span className={`rounded-md border px-1.5 py-0.2 text-[8.5px] font-mono uppercase tracking-[0.15em] ${item.badgeColor} shrink-0`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.desc}
              </p>
              
              {/* Progress track */}
              <div className="mt-2 h-[2.5px] w-full overflow-hidden rounded-full bg-zinc-200/50 dark:bg-zinc-800/50">
                <div
                  className="roadmap-bar h-full rounded-full bg-zinc-800 dark:bg-zinc-200"
                  style={{ 
                    width: '0%', 
                    background: 'linear-gradient(90deg, #18181b 0%, #71717a 100%)' 
                  }}
                  data-level={item.progress}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2.5 mt-4 flex items-center justify-between font-mono text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wider">
        <span>GATEWAY: ACTIVE</span>
        <span>BUILD_V: 1.0.8</span>
      </div>
    </article>
  );
};

export default ProjectRoadmap;
