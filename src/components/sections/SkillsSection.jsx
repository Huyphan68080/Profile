import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { skillCategories, skills } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';

gsap.registerPlugin(ScrollTrigger);

const SkillItem = ({ skill }) => {
  const Icon = skill.icon;
  const progressRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    const bar = progressRef.current;
    const counter = counterRef.current;
    if (!bar || !counter) return;

    const obj = { val: 0 };
    const tl = gsap.to(obj, {
      val: skill.level,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: bar,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        bar.style.width = `${obj.val}%`;
        counter.textContent = `${Math.round(obj.val)}%`;
      },
    });

    return () => tl.kill();
  }, [skill.level]);

  return (
    <div className="group/item relative flex items-center gap-2.5 sm:gap-3 rounded-xl border border-zinc-200/50 bg-white/60 p-2 sm:p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      {/* Icon container with hover scale and rotate */}
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/5 transition-all duration-300 group-hover/item:scale-105 group-hover/item:bg-zinc-800/10">
        {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-700 transition-transform duration-300 group-hover/item:rotate-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-zinc-800 truncate">{skill.name}</span>
          <span ref={counterRef} className="text-[11px] sm:text-[12px] font-mono font-bold text-zinc-800 shrink-0">0%</span>
        </div>
        <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-zinc-200/60">
          <div
            ref={progressRef}
            className="skill-bar h-full rounded-full bg-zinc-800"
            style={{ width: '0%', background: 'linear-gradient(90deg, #18181b 0%, #71717a 100%)' }}
          />
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ category, isActive, layout = 'horizontal', badgeText, onHover, onLeave }) => {
  const categorySkills = category.items
    .map((name) => skills.find((s) => s.name === name))
    .filter(Boolean);

  const containerClass = layout === 'horizontal'
    ? 'col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-center'
    : 'col-span-1 flex flex-col justify-between gap-4';

  const titleColClass = layout === 'horizontal'
    ? 'md:col-span-4 lg:col-span-3 relative pr-2'
    : 'w-full relative pb-1';

  const skillsColClass = layout === 'horizontal'
    ? 'md:col-span-8 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-2.5'
    : 'w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5';

  return (
    <div 
      className={`group/card bento-item glass-panel rounded-[1.4rem] p-4 sm:p-5 relative transition-all duration-300 transform ${containerClass} ${
        isActive 
          ? 'border-zinc-400 bg-white/[0.85] shadow-[0_12px_40px_rgba(24,24,27,0.06),_inset_0_0_12px_rgba(24,24,27,0.02)] scale-[1.01]' 
          : 'border-zinc-200/60 bg-white/[0.75] hover:border-zinc-300 hover:bg-white/[0.85] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:scale-[1.005]'
      }`}
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Corner decorative blueprint brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-zinc-300 opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />

      {/* Shimmer light sweep sheen */}
      <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

      {/* Tech Category Badge */}
      {badgeText && (
        <span className="absolute top-4 right-4 text-[7.5px] font-mono tracking-[0.25em] text-zinc-400 uppercase bg-zinc-800/5 px-2 py-0.5 rounded-md border border-zinc-200/50">
          {badgeText}
        </span>
      )}

      {/* Left/Top Column: Category title */}
      <div className={titleColClass}>
        <h3 className="cyber-title text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-zinc-800 font-extrabold flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full bg-zinc-800 transition-all duration-300 ${isActive ? 'scale-125 bg-zinc-950 shadow-[0_0_6px_rgba(24,24,27,0.4)]' : 'opacity-40'}`} />
          {category.title}
        </h3>
        {category.desc && (
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500/90 hidden md:block">
            {category.desc}
          </p>
        )}
      </div>

      {/* Right/Bottom Column: Skills list grid */}
      <div className={skillsColClass}>
        {categorySkills.map((skill) => (
          <SkillItem key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  );
};

const RadarChart = ({ activeCategory, onHoverCategory }) => {
  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    const obj = { val: 0 };
    const tl = gsap.to(obj, {
      val: 1,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.skills-radar-chart',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      onUpdate: () => {
        setChartProgress(obj.val);
      }
    });
    return () => tl.kill();
  }, []);

  const getCoordinates = (value, angle) => {
    const val = value * chartProgress;
    const r = (val / 100) * 75; // max radius is 75
    const rad = (angle * Math.PI) / 180 - Math.PI / 2;
    const x = 170 + r * Math.cos(rad);
    const y = 150 + r * Math.sin(rad);
    return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}` };
  };

  const axes = [
    { name: 'Frontend', val: 92, angle: 0, cat: 0 },
    { name: 'Styling/UI', val: 93, angle: 60, cat: 0 },
    { name: 'Backend', val: 90, angle: 120, cat: 1 },
    { name: 'Database', val: 86, angle: 180, cat: 1 },
    { name: 'DevOps', val: 88, angle: 240, cat: 2 },
    { name: 'Architecture', val: 90, angle: 300, cat: 2 }
  ];

  const points = axes.map(a => getCoordinates(a.val, a.angle));
  const pointsString = points.map(p => p.str).join(' ');

  return (
    <svg className="w-full h-full select-none overflow-visible" viewBox="0 0 340 300">
      <defs>
        {/* Soft, professional gradient matching the minimalist theme */}
        <linearGradient id="radarAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(24, 24, 27, 0.18)" />
          <stop offset="100%" stopColor="rgba(24, 24, 27, 0.05)" />
        </linearGradient>
        {/* Sonar sweep gradient */}
        <linearGradient id="sweepLineGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(24, 24, 27, 0.0)" />
          <stop offset="100%" stopColor="rgba(24, 24, 27, 0.35)" />
        </linearGradient>
      </defs>

      {/* CSS Styles for GPU Accelerated Animations */}
      <style>{`
        @keyframes sonar-pulse {
          0% { transform: scale(0.1); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes sonar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .sonar-pulse-group-1 {
          animation: sonar-pulse 4.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          transform-origin: 170px 150px;
        }
        .sonar-pulse-group-2 {
          animation: sonar-pulse 4.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          animation-delay: 2.25s;
          transform-origin: 170px 150px;
        }
        .sonar-sweep-line {
          animation: sonar-spin 6.5s linear infinite;
          transform-origin: 170px 150px;
        }
      `}</style>

      {/* Concentric Grid Circles (Radar Sweep Style) */}
      {[75, 60, 45, 30, 15].map((r) => (
        <circle
          key={r}
          cx="170"
          cy="150"
          r={r}
          fill="none"
          stroke="rgba(24, 24, 27, 0.05)"
          strokeWidth="0.75"
        />
      ))}

      {/* Outer Dashed Guide Circle */}
      <circle
        cx="170"
        cy="150"
        r="75"
        fill="none"
        stroke="rgba(24, 24, 27, 0.1)"
        strokeWidth="1"
        strokeDasharray="2, 3"
      />

      {/* Concentric Pulse Rings */}
      <g className="sonar-pulse-group-1" pointerEvents="none">
        <circle cx="170" cy="150" r="75" fill="none" stroke="rgba(24, 24, 27, 0.06)" strokeWidth="0.75" />
      </g>
      <g className="sonar-pulse-group-2" pointerEvents="none">
        <circle cx="170" cy="150" r="75" fill="none" stroke="rgba(24, 24, 27, 0.06)" strokeWidth="0.75" />
      </g>

      {/* Rotating sweep line */}
      <g className="sonar-sweep-line" pointerEvents="none">
        <line 
          x1="170" 
          y1="150" 
          x2="170" 
          y2="75" 
          stroke="url(#sweepLineGradient)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <circle cx="170" cy="75" r="2.5" fill="#18181b" />
      </g>

      {/* Axis Guide Lines */}
      {axes.map((a) => {
        const rad = (a.angle * Math.PI) / 180 - Math.PI / 2;
        const x = 170 + 75 * Math.cos(rad);
        const y = 150 + 75 * Math.sin(rad);
        const isHovered = activeCategory === a.cat;
        return (
          <line
            key={a.name}
            x1="170"
            y1="150"
            x2={x}
            y2={y}
            stroke={isHovered ? 'rgba(24, 24, 27, 0.18)' : 'rgba(24, 24, 27, 0.05)'}
            strokeWidth={isHovered ? '1.25' : '0.75'}
            className="transition-all duration-200"
          />
        );
      })}

      {/* Filled Radar Polygon */}
      <polygon
        points={pointsString}
        fill={activeCategory !== null ? 'rgba(24, 24, 27, 0.12)' : 'url(#radarAreaGradient)'}
        stroke="#18181b"
        strokeWidth="1.5"
        className="transition-all duration-300"
      />

      {/* Interactive Vertices */}
      {axes.map((a, i) => {
        const p = points[i];
        const isHovered = activeCategory === a.cat;
        
        return (
          <g 
            key={a.name}
            className="cursor-pointer"
            onMouseEnter={() => onHoverCategory(a.cat)}
            onMouseLeave={() => onHoverCategory(null)}
          >
            {/* Glowing outer ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r={isHovered ? 6.5 : 4}
              fill={isHovered ? 'rgba(24, 24, 27, 0.14)' : 'rgba(24, 24, 27, 0.03)'}
              stroke={isHovered ? 'rgba(24, 24, 27, 0.3)' : 'rgba(24, 24, 27, 0.08)'}
              strokeWidth="0.75"
              className="transition-all duration-200"
            />
            {/* Center dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r="2"
              fill="#18181b"
            />
          </g>
        );
      })}

      {/* Labels */}
      {axes.map((a) => {
        const rad = (a.angle * Math.PI) / 180 - Math.PI / 2;
        const offset = 92;
        const x = 170 + offset * Math.cos(rad);
        const y = 150 + offset * Math.sin(rad);

        let anchor = 'middle';
        if (a.angle === 60 || a.angle === 120) anchor = 'start';
        if (a.angle === 240 || a.angle === 300) anchor = 'end';

        let dy = '0.35em';
        if (a.angle === 0) dy = '-0.2em';
        if (a.angle === 180) dy = '1.1em';

        const isHovered = activeCategory === a.cat;

        return (
          <text
            key={a.name}
            x={x}
            y={y}
            textAnchor={anchor}
            dy={dy}
            className={`cyber-title text-[9px] font-bold uppercase transition-all duration-200 ${
              isHovered ? 'fill-zinc-950 font-extrabold scale-[1.03]' : 'fill-zinc-400'
            }`}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            {a.name}
          </text>
        );
      })}
    </svg>
  );
};

const SkillsSection = () => {
  const sectionRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.skills-chip', {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        y: 14, opacity: 0, duration: 0.5, ease: 'power3.out',
      });

      gsap.from('.bento-item', {
        scrollTrigger: { trigger: '.bento-item', start: 'top 88%', toggleActions: 'play none none none' },
        y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" className="frame-shell" ref={sectionRef}>
      <div className="frame-surface flex flex-col justify-start md:justify-center overflow-y-auto lg:overflow-hidden">
        <div className="skills-chip story-chip mb-1.5">Tooling</div>
        <SectionTitle
          kicker="Skills"
          title="Tech stack & proficiency."
          subtitle="Tools and frameworks I use to build production-ready digital products."
          compact
          className="bento-item mt-1 mb-3"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center flex-1 overflow-visible lg:overflow-hidden w-full">
          {/* Left Column: Interactive Radar Chart */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <div 
              className="skills-radar-chart glass-panel p-4 pt-6 pb-6 rounded-[1.5rem] w-full max-w-[320px] aspect-square flex items-center justify-center bg-white/[0.75] transition-all duration-300 border-zinc-200/60 relative group"
              style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            >
              {/* Corner blueprint brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-zinc-300" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-300" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-zinc-300" />

              {/* Corner telemetry accents */}
              <div className="absolute top-2 left-3 font-mono text-[7px] text-zinc-400 tracking-wider">
                SYS_COORD: 10.7626° N, 106.6602° E
              </div>
              <div className="absolute top-2 right-3 font-mono text-[7px] text-zinc-400 tracking-wider flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                STATUS: ACTIVE_SCAN
              </div>
              <div className="absolute bottom-2 left-3 font-mono text-[7px] text-zinc-400 tracking-wider">
                FREQ: 2.40 GHz // CH_V: 1.0.3
              </div>
              <div className="absolute bottom-2 right-3 font-mono text-[7px] text-zinc-400 tracking-wider">
                RANGE: 75m // BEAM: STABLE
              </div>

              <RadarChart activeCategory={hoveredCategory} onHoverCategory={setHoveredCategory} />
            </div>
          </div>

          {/* Right Column: Skill Lists (Bento Layout) */}
          <div className="col-span-1 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-center overflow-visible">
            {skillCategories.map((category, idx) => {
              const layout = idx === 0 ? 'horizontal' : 'vertical';
              const badges = ['FRONTEND / UI', 'BACKEND / DB', 'DEVOPS / VCS'];
              
              return (
                <CategoryCard 
                  key={category.title} 
                  category={category} 
                  isActive={hoveredCategory === idx}
                  layout={layout}
                  badgeText={badges[idx]}
                  onHover={() => setHoveredCategory(idx)}
                  onLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
