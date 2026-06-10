import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import TextScramble from '../effects/TextScramble';

gsap.registerPlugin(ScrollTrigger);

const SectionTitle = ({ kicker, title, subtitle, align = 'left', className = '', compact = false, scramble = true }) => {
  const containerRef = useRef(null);
  const alignCls = align === 'center' ? 'mx-auto text-center' : '';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.st-kicker', {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        y: 12, opacity: 0, duration: 0.5, ease: 'power3.out',
      });

      const words = el.querySelectorAll('.st-word');
      if (words.length) {
        gsap.from(words, {
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          y: 20, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out',
        });
      }

      gsap.from('.st-sub', {
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' },
        y: 14, opacity: 0, duration: 0.6, delay: 0.15, ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const titleWords = title.split(' ').map((word, i) => (
    <span key={i} className="st-word inline-block mr-[0.3em]">
      {scramble ? <TextScramble text={word} delay={i * 0.15} /> : word}
    </span>
  ));

  return (
    <div ref={containerRef} className={`${compact ? 'mb-3' : 'mb-4'} max-w-3xl ${alignCls} ${className}`.trim()}>
      <p className={`st-kicker cyber-title uppercase tracking-[0.3em] text-zinc-500 ${compact ? 'text-[11px]' : 'text-[12px]'}`}>{kicker}</p>
      <h2 className={`mt-2 font-black tracking-tighter leading-[1.1] text-zinc-900 ${compact ? 'text-[1.45rem] sm:text-[1.6rem] lg:text-[1.85rem]' : 'text-[1.8rem] sm:text-[2rem] lg:text-[2.3rem]'}`}>
        {titleWords}
      </h2>
      {subtitle ? <p className={`st-sub mt-2 leading-relaxed text-zinc-700 ${compact ? 'text-[14px]' : 'text-[15.5px]'}`}>{subtitle}</p> : null}
    </div>
  );
};

export default SectionTitle;
