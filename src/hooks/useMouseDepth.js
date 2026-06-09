import { useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

const SPRING_CONFIG = {
  stiffness: 76,
  damping: 24,
  mass: 0.7,
};

export const useMouseDepth = ({ disabled = false } = {}) => {
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, SPRING_CONFIG);
  const y = useSpring(targetY, SPRING_CONFIG);
  const rafRef = useRef(0);
  const pointRef = useRef({ x: 0, y: 0 });
  const lastPointerTsRef = useRef(0);

  useEffect(() => {
    if (disabled) {
      targetX.set(0);
      targetY.set(0);
      return undefined;
    }

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const cores = window.navigator.hardwareConcurrency || 4;
    const memory = window.navigator.deviceMemory || 4;
    const lowPowerDevice = cores <= 4 || memory <= 4;

    if (!isFinePointer || lowPowerDevice) {
      return undefined;
    }

    const updateTarget = () => {
      targetX.set(pointRef.current.x);
      targetY.set(pointRef.current.y);
      rafRef.current = 0;
    };

    const scheduleUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(updateTarget);
    };

    const handlePointerMove = (event) => {
      if (event.timeStamp - lastPointerTsRef.current < 16) return;
      lastPointerTsRef.current = event.timeStamp;

      pointRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 1.4,
        y: (event.clientY / window.innerHeight - 0.5) * 1.4,
      };
      scheduleUpdate();
    };

    const resetDepth = () => {
      pointRef.current = { x: 0, y: 0 };
      scheduleUpdate();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', resetDepth);
    window.addEventListener('blur', resetDepth);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', resetDepth);
      window.removeEventListener('blur', resetDepth);
    };
  }, [disabled, targetX, targetY]);

  return { x, y };
};
