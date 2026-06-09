import { useEffect, useRef } from 'react';

const CustomCursor = ({ disabled = false }) => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (disabled) return;
    
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let targetX = -100;
    let targetY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId;

    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      dotX += (targetX - dotX) * 0.4;
      dotY += (targetY - dotY) * 0.4;
      ringX += (targetX - ringX) * 0.15;
      ringY += (targetY - ringY) * 0.15;

      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      
      rafId = requestAnimationFrame(animate);
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-cursor-expand]')
      ) {
        ring.classList.add('scale-150', 'bg-white/10', 'border-transparent');
        ring.classList.remove('border-white/40');
      }
    };

    const onMouseOut = () => {
      ring.classList.remove('scale-150', 'bg-white/10', 'border-transparent');
      ring.classList.add('border-white/40');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(rafId);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99] h-8 w-8 rounded-full border border-white/40 mix-blend-difference transition-all duration-300 ease-out will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      />
    </>
  );
};

export default CustomCursor;
