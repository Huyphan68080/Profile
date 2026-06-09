import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

const RippleButton = ({
  children,
  href,
  external = false,
  className = '',
  onClick,
  type = 'button',
}) => {
  const hasText = className.includes('text-');
  const hasBg = className.includes('bg-') || className.includes('from-');
  const hasBorder = className.includes('border-');

  const baseClass = [
    'relative inline-flex items-center justify-center overflow-hidden rounded-full transition-colors px-4 py-2 min-h-[44px] sm:min-h-0 text-sm font-medium',
    hasBorder ? '' : 'border border-zinc-200 hover:border-zinc-400',
    hasBg ? '' : 'bg-black/[0.03] hover:bg-black/[0.06]',
    hasText ? '' : 'text-zinc-800',
  ].filter(Boolean).join(' ');
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);
  const [magnetOffset, setMagnetOffset] = useState({ x: 0, y: 0 });

  const createRipple = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    setRipples((current) => [...current, { id: `${Date.now()}-${Math.random()}`, x, y, size }]);
  };

  const removeRipple = (id) => {
    setRipples((current) => current.filter((r) => r.id !== id));
  };

  const handleClick = (event) => {
    createRipple(event);
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const targetId = href.substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        if (window.lenis) {
          window.lenis.scrollTo(target, {
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    onClick?.(event);
  };

  const handleMouseMove = (e) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    setMagnetOffset({ x: dx * 4, y: dy * 4 });
  };

  const handleMouseLeave = () => {
    setMagnetOffset({ x: 0, y: 0 });
  };

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
          className="pointer-events-none absolute rounded-full bg-zinc-300/25"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onAnimationComplete={() => removeRipple(ripple.id)}
        />
      ))}
    </>
  );

  const motionStyle = {
    x: magnetOffset.x,
    y: magnetOffset.y,
  };

  if (href) {
    return (
      <motion.a
        ref={btnRef}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={motionStyle}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${baseClass} ${className}`}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={motionStyle}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${baseClass} ${className}`}
    >
      {content}
    </motion.button>
  );
};

export default RippleButton;
