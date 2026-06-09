import { useEffect, useMemo, useRef } from 'react';

const DESKTOP_PARTICLES = 12;
const MOBILE_PARTICLES = 0;
const DESKTOP_LINK_DISTANCE = 80;
const MOBILE_LINK_DISTANCE = 56;
const DESKTOP_MOUSE_RADIUS = 85;
const MOBILE_MOUSE_RADIUS = 60;
const DESKTOP_MOUSE_LINK_DISTANCE = 82;
const MOBILE_MOUSE_LINK_DISTANCE = 60;
const TARGET_FPS_HIGH = 30;
const TARGET_FPS_MEDIUM = 24;
const TARGET_FPS_LOW = 30;

const getPerformanceTier = (isMobile) => {
  if (typeof window === 'undefined') return isMobile ? 'low' : 'medium';
  const cores = window.navigator.hardwareConcurrency || 4;
  const memory = window.navigator.deviceMemory || 4;
  if (isMobile || cores <= 4 || memory <= 4) return 'low';
  if (cores <= 8 || memory <= 8) return 'medium';
  return 'high';
};

const getMotionValue = (value) => {
  if (value && typeof value.get === 'function') return value.get();
  return 0;
};

const createParticles = (count, width, height, isMobile) => {
  const minSpeed = isMobile ? 0.058 : 0.087;
  const maxSpeed = isMobile ? 0.245 : 0.347;
  const particles = [];

  for (let index = 0; index < count; index += 1) {
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * (isMobile ? 1.2 : 1.6) + 0.9,
      alpha: Math.random() * 0.45 + 0.3,
    });
  }

  return particles;
};

const ParticleField = ({ depth, isMobile = false, reduceMotion = false }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);
  const pointerRef = useRef({
    active: false,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
  const lastFrameRef = useRef(0);
  const pauseUntilRef = useRef(0);

  const particleCount = reduceMotion ? 0 : isMobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
  const linkDistance = isMobile ? MOBILE_LINK_DISTANCE : DESKTOP_LINK_DISTANCE;
  const mouseRadius = isMobile ? MOBILE_MOUSE_RADIUS : DESKTOP_MOUSE_RADIUS;
  const mouseLinkDistance = isMobile ? MOBILE_MOUSE_LINK_DISTANCE : DESKTOP_MOUSE_LINK_DISTANCE;
  const performanceTier = getPerformanceTier(isMobile);
  const dotRgb = '120, 120, 120';
  const lineRgb = '200, 200, 200';
  const mouseGlowRgb = '160, 160, 160';

  const networkConfig = useMemo(
    () => ({
      particleCount:
        performanceTier === 'low'
          ? 0
          : performanceTier === 'medium'
            ? Math.max(12, Math.floor(particleCount * 0.576))
            : particleCount,
      linkDistance:
        performanceTier === 'low' ? Math.floor(linkDistance * 0.8) : performanceTier === 'medium' ? Math.floor(linkDistance * 0.9) : linkDistance,
      mouseRadius: performanceTier === 'low' ? Math.floor(mouseRadius * 0.82) : mouseRadius,
      mouseLinkDistance:
        performanceTier === 'low'
          ? Math.floor(mouseLinkDistance * 0.82)
          : performanceTier === 'medium'
            ? Math.floor(mouseLinkDistance * 0.9)
            : mouseLinkDistance,
      maxVelocity: performanceTier === 'low' ? 0.6 : isMobile ? 0.65 : 0.85,
      attraction: performanceTier === 'low' ? 0.012 : isMobile ? 0.014 : 0.02,
      pullLerp: performanceTier === 'low' ? 0.1 : isMobile ? 0.12 : 0.16,
      lineAlpha: isMobile ? 0.08 : 0.12,
      dotAlpha: isMobile ? 0.44 : 0.54,
      maxLinksPerParticle: performanceTier === 'low' ? 0 : performanceTier === 'medium' ? 4 : 6,
      maxPixelRatio: performanceTier === 'low' ? 1 : performanceTier === 'medium' ? 1.1 : 1.25,
      targetFps: performanceTier === 'low' ? TARGET_FPS_LOW : performanceTier === 'medium' ? TARGET_FPS_MEDIUM : TARGET_FPS_HIGH,
    }),
    [isMobile, linkDistance, mouseLinkDistance, mouseRadius, particleCount, performanceTier],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || networkConfig.particleCount === 0) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const pointer = pointerRef.current;
    const resizeCanvas = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, networkConfig.maxPixelRatio);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particlesRef.current = createParticles(networkConfig.particleCount, width, height, isMobile);
      pointer.x = width / 2;
      pointer.y = height / 2;
      pointer.targetX = width / 2;
      pointer.targetY = height / 2;
    };

    const drawNetwork = (timestamp) => {
      const frameInterval = 1000 / networkConfig.targetFps;
      if (document.hidden || timestamp < pauseUntilRef.current || timestamp - lastFrameRef.current < frameInterval) {
        rafRef.current = window.requestAnimationFrame(drawNetwork);
        return;
      }
      const delta = Math.min((timestamp - lastFrameRef.current) / 16.67, 2);
      lastFrameRef.current = timestamp;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const parallaxX = getMotionValue(depth?.x) * (isMobile ? 4 : 8);
      const parallaxY = getMotionValue(depth?.y) * (isMobile ? 4 : 8);

      context.clearRect(0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * networkConfig.pullLerp;
      pointer.y += (pointer.targetY - pointer.y) * networkConfig.pullLerp;

      const particles = particlesRef.current;
      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        if (pointer.active) {
          const dxToMouse = pointer.x - particle.x;
          const dyToMouse = pointer.y - particle.y;
          const distanceToMouse = Math.hypot(dxToMouse, dyToMouse) || 1;

          if (distanceToMouse < networkConfig.mouseRadius) {
            const attractionForce = (1 - distanceToMouse / networkConfig.mouseRadius) * networkConfig.attraction;
            particle.vx += (dxToMouse / distanceToMouse) * attractionForce;
            particle.vy += (dyToMouse / distanceToMouse) * attractionForce;
          }
        }

        particle.vx *= 0.988;
        particle.vy *= 0.988;

        const velocity = Math.hypot(particle.vx, particle.vy);
        if (velocity > networkConfig.maxVelocity) {
          particle.vx = (particle.vx / velocity) * networkConfig.maxVelocity;
          particle.vy = (particle.vy / velocity) * networkConfig.maxVelocity;
        }

        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      const cellSize = networkConfig.linkDistance;
      const cellMap = new Map();

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const cellX = Math.floor(particle.x / cellSize);
        const cellY = Math.floor(particle.y / cellSize);
        const key = `${cellX},${cellY}`;
        const bucket = cellMap.get(key);
        if (bucket) {
          bucket.push(index);
        } else {
          cellMap.set(key, [index]);
        }
      }

      context.lineWidth = 1;
      for (let i = 0; i < particles.length; i += 1) {
        const particleA = particles[i];
        const pointAX = particleA.x + parallaxX;
        const pointAY = particleA.y + parallaxY;
        const particleCellX = Math.floor(particleA.x / cellSize);
        const particleCellY = Math.floor(particleA.y / cellSize);
        let linkedCount = 0;

        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
            const neighbor = cellMap.get(`${particleCellX + offsetX},${particleCellY + offsetY}`);
            if (!neighbor) continue;

            for (let k = 0; k < neighbor.length; k += 1) {
              const j = neighbor[k];
              if (j <= i) continue;

              const particleB = particles[j];
              const pointBX = particleB.x + parallaxX;
              const pointBY = particleB.y + parallaxY;
              const dx = pointAX - pointBX;
              const dy = pointAY - pointBY;
              const distance = Math.hypot(dx, dy);

              if (distance > networkConfig.linkDistance) continue;
              const alpha = (1 - distance / networkConfig.linkDistance) * networkConfig.lineAlpha;
              context.strokeStyle = `rgba(${lineRgb}, ${alpha.toFixed(4)})`;
              context.beginPath();
              context.moveTo(pointAX, pointAY);
              context.lineTo(pointBX, pointBY);
              context.stroke();
              linkedCount += 1;
              if (linkedCount >= networkConfig.maxLinksPerParticle) break;
            }

            if (linkedCount >= networkConfig.maxLinksPerParticle) break;
          }
          if (linkedCount >= networkConfig.maxLinksPerParticle) break;
        }

        if (pointer.active) {
          const dxMouse = pointAX - pointer.x;
          const dyMouse = pointAY - pointer.y;
          const mouseDistance = Math.hypot(dxMouse, dyMouse);
          if (mouseDistance < networkConfig.mouseLinkDistance) {
            const mouseAlpha = (1 - mouseDistance / networkConfig.mouseLinkDistance) * 0.22;
            context.strokeStyle = `rgba(${lineRgb}, ${mouseAlpha.toFixed(4)})`;
            context.beginPath();
            context.moveTo(pointAX, pointAY);
            context.lineTo(pointer.x, pointer.y);
            context.stroke();
          }
        }
      }

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const pointX = particle.x + parallaxX;
        const pointY = particle.y + parallaxY;
        context.fillStyle = `rgba(${dotRgb}, ${(particle.alpha * networkConfig.dotAlpha).toFixed(4)})`;
        context.beginPath();
        context.arc(pointX, pointY, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      if (pointer.active) {
        const gradient = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, networkConfig.mouseRadius);
        gradient.addColorStop(0, `rgba(${mouseGlowRgb}, 0.05)`);
        gradient.addColorStop(1, `rgba(${mouseGlowRgb}, 0)`);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(pointer.x, pointer.y, networkConfig.mouseRadius, 0, Math.PI * 2);
        context.fill();
      }

      rafRef.current = window.requestAnimationFrame(drawNetwork);
    };

    const handlePointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.active = true;
      pointer.targetX = event.clientX - bounds.left;
      pointer.targetY = event.clientY - bounds.top;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleScroll = () => {
      pauseUntilRef.current = performance.now() + 200;
    };

    resizeCanvas();
    lastFrameRef.current = performance.now();
    drawNetwork(lastFrameRef.current);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [depth, dotRgb, isMobile, lineRgb, mouseGlowRgb, networkConfig]);

  if (!networkConfig.particleCount) return null;

  return <canvas ref={canvasRef} className="particle-network-canvas absolute inset-0 h-full w-full" />;
};

export default ParticleField;
