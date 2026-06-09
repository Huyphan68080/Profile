import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const Reveal = ({ children, delay = 0, className = '', direction = 'up' }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const yVal = direction === 'up' ? 24 : direction === 'down' ? -24 : 0;
    const xVal = direction === 'left' ? 24 : direction === 'right' ? -24 : 0;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: yVal,
        x: xVal,
        opacity: 0,
        duration: 0.7,
        delay: Math.min(delay, 0.3),
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Reveal;
