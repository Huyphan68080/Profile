import { motion, useTransform } from 'framer-motion';
import { useMemo } from 'react';
import ParticleField from '../effects/ParticleField';
import BackgroundBot from '../effects/BackgroundBot';
import CanvasMeteors from '../effects/CanvasMeteors';

const AnimatedBackground = ({ depth, isMobile = false, reduceMotion = false }) => {
  const orbs = useMemo(() => {
    if (reduceMotion || isMobile) return [];
    return [
      {
        size: 'h-[440px] w-[440px]',
        position: 'top-[8%] left-[12%]',
        gradient: 'from-zinc-400/5 via-zinc-500/3 to-transparent',
        blur: 'blur-[20px]',
      },
      {
        size: 'h-[360px] w-[360px]',
        position: 'bottom-[12%] right-[8%]',
        gradient: 'from-zinc-300/4 via-zinc-500/2 to-transparent',
        blur: 'blur-[24px]',
      },
    ];
  }, [isMobile, reduceMotion]);

  const parallaxX = useTransform(depth.x, [-0.7, 0.7], [-14, 14]);
  const parallaxY = useTransform(depth.y, [-0.7, 0.7], [-14, 14]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--bg-base)]"
      style={{ contain: 'layout paint style' }}
      aria-hidden="true"
    >
      {/* 2D subtle stardust/particle field */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
        <ParticleField depth={depth} isMobile={isMobile} reduceMotion={reduceMotion} />
      </div>

      {/* Canvas-drawn procedural meteorites */}
      {!reduceMotion && !isMobile && (
        <CanvasMeteors depth={depth} />
      )}

      {/* 3D Background Bot geometric companion */}
      <BackgroundBot isMobile={isMobile} reduceMotion={reduceMotion} />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Parallax orbs */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`pointer-events-none absolute rounded-full bg-gradient-to-br ${orb.gradient} ${orb.size} ${orb.position} ${orb.blur} will-change-transform`}
          style={{ x: parallaxX, y: parallaxY }}
        />
      ))}

      {/* Aurora layers */}
      {!reduceMotion && (
        <motion.div
          className="aurora-layer aurora-layer-primary pointer-events-none absolute -left-[15%] -top-[20%] h-[80vh] w-[80vw] will-change-transform"
          style={{ x: parallaxX, y: parallaxY }}
        />
      )}
      {!reduceMotion && !isMobile && (
        <motion.div
          className="aurora-layer aurora-layer-secondary pointer-events-none absolute -bottom-[12%] -right-[12%] h-[58vh] w-[58vw] will-change-transform"
          style={{ x: parallaxX, y: parallaxY }}
        />
      )}

      {/* Cyber grid */}
      <div
        className="cyber-grid pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--surface-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--surface-border) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 68%)',
        }}
      />

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 48%, transparent 30%, color-mix(in srgb, var(--bg-base) 60%, transparent) 100%)',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
