import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AboutSection from './components/sections/AboutSection';
import ContactSection from './components/sections/ContactSection';
import HeroSection from './components/sections/HeroSection';
import IpCheckSection from './components/sections/IpCheckSection';
import ProjectsSection from './components/sections/ProjectsSection';
import SkillsSection from './components/sections/SkillsSection';
import AnimatedBackground from './components/layout/AnimatedBackground';
import LoadingScreen from './components/layout/LoadingScreen';
import MouseGlow from './components/effects/MouseGlow';
import CustomCursor from './components/effects/CustomCursor';

import { navLinks } from './data/siteData';
import { useMouseDepth } from './hooks/useMouseDepth';
import { useVisitorInsights } from './hooks/useVisitorInsights';

gsap.registerPlugin(ScrollTrigger);

const SectionFrame = forwardRef(function SectionFrame({ frameId, active = false, className = '', children }, ref) {
  return (
    <div
      ref={ref}
      id={frameId}
      data-frame-id={frameId}
      className={`section-frame ${active ? 'is-active' : ''} ${className}`.trim()}
    >
      <div className="section-frame__glow" />
      <div className="section-frame__beam" />
      <div className="section-wrap gpu-layer">{children}</div>
    </div>
  );
});

const App = () => {
  const visitorInsights = useVisitorInsights();
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  const frameDefinitions = useMemo(
    () => [
      { id: 'hero', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'ip-check', label: 'Telemetry' },
      { id: 'contact', label: 'Contact' },
    ],
    []
  );

  const frameIds = useMemo(() => frameDefinitions.map((item) => item.id), [frameDefinitions]);
  const frameRefs = useRef({});
  const lenisRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const [activeFrame, setActiveFrame] = useState(frameIds[0]);
  const activeFrameRef = useRef(frameIds[0]);

  useEffect(() => {
    activeFrameRef.current = activeFrame;
  }, [activeFrame]);


  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    const cores = window.navigator.hardwareConcurrency;
    const memory = window.navigator.deviceMemory;
    return (cores !== undefined && cores <= 2) || (memory !== undefined && memory <= 2);
  });
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const shouldSimplifyMotion = prefersReducedMotion || isLowPerformanceDevice;
  const depth = useMouseDepth({ disabled: shouldSimplifyMotion });

  const registerFrame = useCallback(
    (frameId) => (node) => {
      if (node) {
        frameRefs.current[frameId] = node;
      }
    },
    []
  );

  const scrollToFrame = useCallback((frameId) => {
    const frameNode = frameRefs.current[frameId];
    if (!frameNode) return;
    isAnimatingRef.current = true;
    setActiveFrame(frameId);

    const releaseLock = () => {
      isAnimatingRef.current = false;
    };

    // Safety timeout of 1.1s to release lock in case onComplete is not triggered
    const safetyTimeout = setTimeout(releaseLock, 1100);

    if (lenisRef.current) {
      lenisRef.current.scrollTo(frameNode, {
        duration: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lock: true,
        onComplete: () => {
          clearTimeout(safetyTimeout);
          setTimeout(releaseLock, 150);
        }
      });
    } else {
      clearTimeout(safetyTimeout);
      releaseLock();
    }
  }, []);

  // Loading progress
  useEffect(() => {
    let timeoutId;
    const intervalId = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) return 100;
        const increment =
          current < 60 ? 3 + Math.random() * 5 : current < 86 ? 1.5 + Math.random() * 3 : 0.6 + Math.random() * 1.2;
        const nextValue = Math.min(100, current + increment);
        if (nextValue >= 100) {
          window.clearInterval(intervalId);
          timeoutId = window.setTimeout(() => setIsLoading(false), 540);
        }
        return nextValue;
      });
    }, 88);
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  // Lock/unlock Lenis during loading
  useEffect(() => {
    if (isLoading && lenisRef.current) {
      lenisRef.current.stop();
    } else if (!isLoading && lenisRef.current) {
      lenisRef.current.start();
      // Wait for loading screen unmount/layout stabilization before refreshing GSAP ScrollTrigger
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Lenis smooth scroll + GSAP integration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      // Reset scroll position to 0 immediately on mount to prevent browser scroll restoration misalignment
      window.scrollTo(0, 0);
    }

    const lenis = new Lenis({
      duration: 0.95,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      infinite: false,
      lerp: 0.085,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    window.lenis = lenis; // Expose globally for single-click nav handlers
    lenis.on('scroll', ScrollTrigger.update);

    const rafCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    if (isLoading) {
      lenis.stop();
    }

    return () => {
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
      lenisRef.current = null;
      window.lenis = null;
    };
  }, []);

  // Media queries
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobileView(e.matches);
    setIsMobileView(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReducedMotion(e.matches);
    setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const cores = window.navigator.hardwareConcurrency;
    const memory = window.navigator.deviceMemory;
    setIsLowPerformanceDevice((cores !== undefined && cores <= 2) || (memory !== undefined && memory <= 2));
  }, []);

  // Active frame detection
  useEffect(() => {
    if (isLoading) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isAnimatingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveFrame(visible[0].target.dataset.frameId || frameIds[0]);
        }
      },
      { threshold: [0.4, 0.6, 0.8], rootMargin: '-10% 0px -10% 0px' }
    );
    frameIds.forEach((id) => {
      const node = frameRefs.current[id];
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [frameIds, isLoading]);

  // URL hash sync
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash !== `#${activeFrame}`) {
      window.history.replaceState(null, '', `#${activeFrame}`);
    }
  }, [activeFrame]);

  // Handle initial hash
  useEffect(() => {
    if (isLoading) return;
    const hash = window.location.hash.replace('#', '');
    if (hash && frameIds.includes(hash)) {
      const frameNode = frameRefs.current[hash];
      if (frameNode && lenisRef.current) {
        // Snap immediately under the loader exit
        lenisRef.current.scrollTo(frameNode, { immediate: true });
        setActiveFrame(hash);
      }
    }
  }, [frameIds, isLoading]);

  // Keyboard navigation
  useEffect(() => {
    if (isLoading) return undefined;
    const handleKey = (e) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, select, button, [contenteditable]')) return;
      const idx = frameIds.indexOf(activeFrame);
      if (idx === -1) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const next = Math.min(frameIds.length - 1, idx + 1);
        if (next !== idx) scrollToFrame(frameIds[next]);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const next = Math.max(0, idx - 1);
        if (next !== idx) scrollToFrame(frameIds[next]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToFrame(frameIds[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToFrame(frameIds[frameIds.length - 1]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [frameIds, isLoading, activeFrame, scrollToFrame]);

  // Gestures (Wheel & Touch) snapping interceptor
  useEffect(() => {
    if (isLoading) return undefined;

    const handleWheel = (e) => {
      let target = e.target;
      while (target && target !== document.body) {
        if (target.hasAttribute && (target.hasAttribute('data-lenis-prevent') || target.classList.contains('overflow-y-auto'))) {
          if (target.scrollHeight > target.clientHeight) {
            return; // let internal scrollable containers scroll
          }
        }
        target = target.parentNode;
      }

      e.preventDefault();
      e.stopImmediatePropagation();

      if (isAnimatingRef.current) return;

      const idx = frameIds.indexOf(activeFrameRef.current);
      if (idx === -1) return;

      if (e.deltaY > 15) {
        const nextIdx = Math.min(frameIds.length - 1, idx + 1);
        if (nextIdx !== idx) {
          scrollToFrame(frameIds[nextIdx]);
        }
      } else if (e.deltaY < -15) {
        const nextIdx = Math.max(0, idx - 1);
        if (nextIdx !== idx) {
          scrollToFrame(frameIds[nextIdx]);
        }
      }
    };

    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      let target = e.target;
      let preventDefaultScroll = true;
      while (target && target !== document.body) {
        if (target.hasAttribute && (target.hasAttribute('data-lenis-prevent') || target.classList.contains('overflow-y-auto'))) {
          if (target.scrollHeight > target.clientHeight) {
            preventDefaultScroll = false;
            break;
          }
        }
        target = target.parentNode;
      }

      if (preventDefaultScroll) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopImmediatePropagation();
      }
    };

    const handleTouchEnd = (e) => {
      let target = e.target;
      while (target && target !== document.body) {
        if (target.hasAttribute && (target.hasAttribute('data-lenis-prevent') || target.classList.contains('overflow-y-auto'))) {
          if (target.scrollHeight > target.clientHeight) {
            return;
          }
        }
        target = target.parentNode;
      }

      if (isAnimatingRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopImmediatePropagation();
        return;
      }

      const endY = e.changedTouches[0].clientY;
      const diffY = startY - endY;

      if (Math.abs(diffY) > 40) {
        const idx = frameIds.indexOf(activeFrameRef.current);
        if (idx === -1) return;

        if (diffY > 0) {
          const nextIdx = Math.min(frameIds.length - 1, idx + 1);
          if (nextIdx !== idx) {
            scrollToFrame(frameIds[nextIdx]);
          }
        } else {
          const nextIdx = Math.max(0, idx - 1);
          if (nextIdx !== idx) {
            scrollToFrame(frameIds[nextIdx]);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd, { capture: true });
    };
  }, [frameIds, scrollToFrame, isLoading]);

  const handleFrameNavigate = useCallback(
    (frameId) => {
      if (frameIds.includes(frameId)) scrollToFrame(frameId);
    },
    [frameIds, scrollToFrame]
  );

  const navItems = useMemo(
    () => navLinks.map((item) => ({ ...item, active: item.href === `#${activeFrame}` })),
    [activeFrame]
  );

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden">
      <CustomCursor disabled={isMobileView || shouldSimplifyMotion} />
      <AnimatedBackground depth={depth} isMobile={isMobileView} reduceMotion={shouldSimplifyMotion} />
      <MouseGlow disabled={isMobileView || shouldSimplifyMotion} />


      <div 
        className="pointer-events-none fixed inset-x-0 top-0 z-20 h-20" 
        style={{ background: 'linear-gradient(to bottom, var(--bg-base) 10%, color-mix(in srgb, var(--bg-base) 30%, transparent) 60%, transparent)' }}
      />
      <AnimatePresence>{isLoading ? <LoadingScreen progress={progress} isMobile={isMobileView} /> : null}</AnimatePresence>
      <motion.main 
        initial={{ opacity: 0 }}
        animate={!isLoading ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className="frame-main relative z-10 px-0"
      >
        <SectionFrame ref={registerFrame('hero')} frameId="hero" active={activeFrame === 'hero'} className="hero-frame">
          <HeroSection isLoading={isLoading} />
        </SectionFrame>
        <SectionFrame ref={registerFrame('about')} frameId="about" active={activeFrame === 'about'}>
          <AboutSection />
        </SectionFrame>
        <SectionFrame ref={registerFrame('skills')} frameId="skills" active={activeFrame === 'skills'}>
          <SkillsSection />
        </SectionFrame>
        <SectionFrame ref={registerFrame('projects')} frameId="projects" active={activeFrame === 'projects'}>
          <ProjectsSection />
        </SectionFrame>
        <SectionFrame ref={registerFrame('ip-check')} frameId="ip-check" active={activeFrame === 'ip-check'}>
          <IpCheckSection visitorInsights={visitorInsights} />
        </SectionFrame>
        <SectionFrame ref={registerFrame('contact')} frameId="contact" active={activeFrame === 'contact'}>
          <ContactSection />
        </SectionFrame>
      </motion.main>
    </div>
  );
};

export default App;
