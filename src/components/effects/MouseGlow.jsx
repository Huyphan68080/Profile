import { useEffect, useRef } from 'react';

const MouseGlow = ({ disabled = false }) => {
  const glowRef = useRef(null);

  useEffect(() => {
    if (disabled) return;
    const el = glowRef.current;
    if (!el) return;

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el.style.transform = `translate3d(${currentX - 100}px, ${currentY - 100}px, 0)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-50 h-[200px] w-[200px] rounded-full mix-blend-multiply"
      style={{
        background: 'radial-gradient(circle, var(--mouse-glow) 0%, transparent 70%)',
        filter: 'blur(40px)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
};

export default MouseGlow;
