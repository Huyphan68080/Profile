import { useEffect, useMemo, useRef } from 'react';

const METEOR_COUNT = 18;
const margin = 80;

const getMotionValue = (value) => {
  if (value && typeof value.get === 'function') return value.get();
  return 0;
};

const createMeteors = (count) => {
  const meteors = [];
  for (let i = 0; i < count; i++) {
    const z = 0.15 + Math.random() * 0.85; // z depth (0.15 is far, 1.0 is close)
    const numVertices = 5 + Math.floor(Math.random() * 3); // 5 to 7 vertices
    const vertexOffsets = [];
    for (let v = 0; v < numVertices; v++) {
      vertexOffsets.push(0.72 + Math.random() * 0.56); // irregular vertex length factor
    }
    meteors.push({
      xPct: Math.random(), // normalized coordinate X
      yPct: Math.random(), // normalized coordinate Y
      z,
      baseRadius: 6 + Math.random() * 9, // 6px to 15px radius
      baseRotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.005 + (Math.random() > 0.5 ? 0.002 : -0.002), // idle spin speed
      numVertices,
      vertexOffsets,
      parallaxSpeed: (z + 0.3) * 1.4, // vertical scroll translation speed
    });
  }
  return meteors;
};

const CanvasMeteors = ({ depth }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const meteorsRef = useRef([]);
  const scrollProgressRef = useRef(0);

  // Generate meteor data once on mount
  useEffect(() => {
    meteorsRef.current = createMeteors(METEOR_COUNT);
  }, []);

  // Track window scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressRef.current = maxScroll > 0 ? scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Main canvas execution loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const resizeCanvas = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);

      const scrollProgress = scrollProgressRef.current;
      const depthX = getMotionValue(depth?.x);
      const depthY = getMotionValue(depth?.y);

      meteorsRef.current.forEach((meteor) => {
        // Initial coordinates scaled to screen size
        const initialX = meteor.xPct * width;
        const initialY = meteor.yPct * height;

        // Vertical scroll parallax offset (simulate scrolling past objects)
        const scrollOffset = scrollProgress * meteor.parallaxSpeed * height;

        // Inverse mouse depth parallax (inverse movement of mouse pointer)
        const mouseOffsetX = -depthX * 26 * meteor.z;
        const mouseOffsetY = -depthY * 26 * meteor.z;

        // Wrapped coordinate boundaries with buffer margins
        const rangeX = width + margin * 2;
        let x = (initialX + mouseOffsetX + margin) % rangeX;
        if (x < 0) x += rangeX;
        x -= margin;

        const rangeY = height + margin * 2;
        let y = (initialY - scrollOffset + mouseOffsetY + margin) % rangeY;
        if (y < 0) y += rangeY;
        y -= margin;

        // Render irregular polygon meteor shape
        context.save();
        context.translate(x, y);

        // Rotation combining initial offset, scroll parallax spin, and idle drift
        const scrollRotation = scrollProgress * meteor.z * 3.5;
        const timeRotation = time * meteor.rotationSpeed * 0.05;
        context.rotate(meteor.baseRotation + scrollRotation + timeRotation);

        context.beginPath();
        const radius = meteor.baseRadius * (0.4 + meteor.z * 0.8);
        for (let v = 0; v < meteor.numVertices; v++) {
          const angle = (v / meteor.numVertices) * Math.PI * 2;
          const r = radius * meteor.vertexOffsets[v];
          const vx = Math.cos(angle) * r;
          const vy = Math.sin(angle) * r;
          if (v === 0) {
            context.moveTo(vx, vy);
          } else {
            context.lineTo(vx, vy);
          }
        }
        context.closePath();

        // Styling: transparent outline, zero fill
        const baseOpacity = 0.03 + meteor.z * 0.05;
        context.strokeStyle = `rgba(15, 23, 42, ${baseOpacity.toFixed(3)})`;
        context.lineWidth = 0.8 + meteor.z * 0.8;
        context.stroke();

        context.restore();
      });

      rafRef.current = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    rafRef.current = window.requestAnimationFrame(draw);

    window.addEventListener('resize', resizeCanvas, { passive: true });

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [depth]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none z-[1]" />;
};

export default CanvasMeteors;
