import { motion } from 'framer-motion';

const getProgressPhase = (pct) => {
  if (pct < 15) return "Initializing Core System";
  if (pct < 35) return "Resolving Vector Shaders";
  if (pct < 60) return "Staggering Scroll Triggers";
  if (pct < 85) return "Synchronizing Lanyard Presence";
  return "Compiling Spatial Canvas";
};

const LoadingScreen = ({ progress = 0, isMobile = false }) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  
  // Brand name text split
  const brandLetters = "HUY PHAN".split("");

  // SVG Circle calculations
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-transparent overflow-hidden pointer-events-none"
    >
      {/* Blueprint Dot Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] z-[1]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />
      
      {/* Staggered Vertical Panels (Curtain Wipe) */}
      <div className="absolute inset-0 flex z-0">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-full flex-1 bg-[#0b0b0c] relative"
            initial={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{
              duration: 0.9,
              ease: [0.76, 0, 0.24, 1], // cinematic luxury bezier curve
              delay: i * 0.08,
            }}
          >
            {/* Bottom edge glowing light trail */}
            <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Floating Center Content */}
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
      >
        {/* Brand Name (Cinematic Staggered Letter Reveal) */}
        <div className="flex overflow-hidden">
          {brandLetters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.04,
              }}
              className="cyber-title text-base font-extrabold uppercase tracking-[0.55em] text-white inline-block last:tracking-normal"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
        
        {/* Thin minimalist line separator */}
        <div className="w-10 h-[1px] bg-white/10 my-4" />

        {/* Circular Progress Ring with Centered Percentage */}
        <div className="relative h-20 w-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-white/5 fill-none"
              strokeWidth="1"
            />
            {/* Active progress */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-white/40 fill-none"
              strokeWidth="1.5"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          {/* Centered counter number */}
          <span className="absolute font-mono text-lg font-light tracking-tighter text-white/90">
            {clamped}%
          </span>
        </div>

        {/* Dynamic System Setup Status (Micro-interaction) */}
        <div className="h-4 overflow-hidden mt-4">
          <motion.p
            key={getProgressPhase(clamped)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.35, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-white pl-[0.3em]"
          >
            {getProgressPhase(clamped)}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
