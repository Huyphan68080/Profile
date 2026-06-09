import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { aboutParagraphs, aboutStats, experienceTimeline } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.bento-item', {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      });
      
      gsap.from('.timeline-item', {
        scrollTrigger: { trigger: '.timeline-container', start: 'top 85%', toggleActions: 'play none none none' },
        x: -15, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out',
      });

      // Animated counters
      el.querySelectorAll('.about-counter').forEach((counter) => {
        const target = counter.dataset.value;
        const isNum = /^\d+/.test(target);
        if (isNum) {
          const suffix = target.replace(/^\d+/, '');
          gsap.from(counter, {
            scrollTrigger: { trigger: counter, start: 'top 90%', toggleActions: 'play none none none' },
            textContent: 0,
            duration: 1.4,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate() {
              counter.textContent = Math.round(parseFloat(counter.textContent)) + suffix;
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="frame-shell" ref={sectionRef}>
      <div className="frame-surface flex flex-col justify-start md:justify-center overflow-y-auto lg:overflow-hidden">
        <div className="bento-item story-chip mb-1.5">Backstory</div>
        <SectionTitle
          kicker="About"
          title="The story behind the code."
          subtitle="A builder who turns ideas into immersive digital experiences."
          compact
          className="bento-item mt-1 mb-3"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch flex-1 overflow-visible lg:overflow-hidden w-full">
          {/* Column 1 (Bio Dossier Card) */}
          <div className="group/card bento-item glass-panel rounded-[1.4rem] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden bg-white/[0.28] hover:bg-white/[0.34] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            {/* Corner decorative blueprint brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />

            {/* Shimmer sheen */}
            <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

            <div className="w-full">
              {/* Dossier Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/50 pb-2 mb-3">
                <span className="font-mono text-[7px] sm:text-[7.5px] text-zinc-400 uppercase tracking-[0.2em]">[ SYSTEM_DOSSIER // HUY_PHAN ]</span>
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 animate-pulse" />
              </div>

              {/* Bio Content */}
              <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-1" data-lenis-prevent>
                {aboutParagraphs.map((text, idx) => (
                  <p key={idx} className="text-[11.5px] leading-relaxed text-zinc-600 sm:text-[12.5px]">
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Dossier Footer */}
            <div className="border-t border-zinc-200/50 pt-2.5 mt-3 font-mono text-[7px] sm:text-[7.5px] text-zinc-400 flex justify-between tracking-wider">
              <span>LOC: HCMC, VN</span>
              <span>STATUS: CORE_STABLE</span>
            </div>
          </div>

          {/* Column 2 (Timeline Card) */}
          <div className="group/card bento-item timeline-container glass-panel rounded-[1.4rem] p-4 sm:p-5 flex flex-col relative overflow-hidden bg-white/[0.28] hover:bg-white/[0.34] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            {/* Corner decorative blueprint brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />

            {/* Shimmer sheen */}
            <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

            {/* Tech Timeline Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/50 pb-2 mb-3">
              <h3 className="cyber-title text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-extrabold">Experience Timeline</h3>
              <span className="font-mono text-[7px] text-zinc-400 tracking-wider">REF_ID: 9942</span>
            </div>

            {/* Timeline Tree */}
            <div className="relative border-l border-dashed border-zinc-300 pl-4 overflow-y-auto pr-1 flex-1 mt-1" data-lenis-prevent>
              {experienceTimeline.map((item, idx) => {
                const isLatest = idx === 0;
                return (
                  <div key={idx} className="group/item timeline-item relative mb-4 last:mb-0 transition-transform duration-200 hover:translate-x-0.5">
                    {isLatest ? (
                      <>
                        <div className="absolute -left-[21.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-800 border-2 border-white shadow-[0_0_6px_rgba(24,24,27,0.3)] z-10" />
                        <div className="absolute -left-[25.5px] top-0.5 h-4.5 w-4.5 rounded-full bg-zinc-800/10 animate-ping pointer-events-none" />
                      </>
                    ) : (
                      <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full border border-zinc-300 bg-[var(--bg-base)] group-hover/item:bg-zinc-800 group-hover/item:border-zinc-800 transition-colors duration-200 z-10" />
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] sm:text-[8.5px] font-mono uppercase tracking-[0.2em] text-zinc-400">{item.year}</span>
                      {isLatest && (
                        <span className="text-[6.5px] font-mono tracking-wider text-emerald-600 bg-emerald-500/5 px-1 py-0.2 rounded border border-emerald-500/20 uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="mt-0.5 text-[11.5px] sm:text-[12px] font-bold text-zinc-900 leading-tight">{item.role}</h4>
                    <div className="text-[10px] font-medium text-zinc-700/90">{item.company}</div>
                    <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3 (Diagnostic Stats Cards - Vertically stacked) */}
          <div className="flex flex-col gap-3 justify-between h-full">
            {aboutStats.map((stat, idx) => {
              const telemetryLabels = ['COMPONENT_UPTIME', 'API_INTEGRATIONS', 'Lighthouse_DIAG'];
              return (
                <article
                  key={stat.label}
                  className="group/card bento-item glass-panel rounded-[1.4rem] p-4 flex-1 flex flex-col justify-center relative overflow-hidden bg-white/[0.80] hover:bg-white/[0.90] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {/* Corner decorative blueprint brackets */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-200 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-200 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-200 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-200 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />

                  {/* Shimmer sheen */}
                  <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

                  {/* Corner telemetry tag */}
                  <span className="absolute top-3.5 right-4 font-mono text-[6.5px] text-zinc-400 tracking-widest uppercase">
                    [{telemetryLabels[idx]}]
                  </span>

                  <p
                    className="about-counter text-xl sm:text-2xl font-black text-zinc-800 tracking-tight"
                    data-value={stat.value}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[8.5px] sm:text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-extrabold">{stat.label}</p>
                  
                  {/* Glowing progress line */}
                  <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-zinc-200/50">
                    <div
                      className="h-full rounded-full bg-zinc-800 transition-all duration-500 group-hover/card:opacity-90"
                      style={{ 
                        width: `${Math.min(100, parseInt(stat.value, 10) * 10 || 50)}%`,
                        background: 'linear-gradient(90deg, #18181b 0%, #71717a 100%)'
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
