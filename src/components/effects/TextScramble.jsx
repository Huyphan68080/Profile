import { useEffect, useRef, useState } from 'react';

const CHARS = '!<>-_\\\\/[]{}—=+*^?#________';

const TextScramble = ({ text, delay = 0, scramble = true }) => {
  if (!scramble) return <>{text}</>;

  const [displayText, setDisplayText] = useState('');
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let frame = 0;
    let rafId = null;
    let observer = null;
    const queue = [];

    // Initialize queue
    for (let i = 0; i < text.length; i++) {
      queue.push({
        from: CHARS[Math.floor(Math.random() * CHARS.length)],
        to: text[i],
        start: Math.floor(Math.random() * 20) + delay * 60,
        end: Math.floor(Math.random() * 20) + delay * 60 + 20,
        char: ''
      });
    }

    const update = () => {
      let output = '';
      let complete = 0;
      
      for (let i = 0, n = queue.length; i < n; i++) {
        let { from, to, start, end, char } = queue[i];
        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = CHARS[Math.floor(Math.random() * CHARS.length)];
            queue[i].char = char;
          }
          output += `<span class="opacity-40 font-mono">${char}</span>`;
        } else {
          output += `<span class="opacity-20 font-mono">${from}</span>`;
        }
      }
      
      setDisplayText(output);
      
      if (complete === queue.length) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(update);
        frame++;
      }
    };

    const handleIntersect = (entries) => {
      if (entries[0].isIntersecting) {
        rafId = requestAnimationFrame(update);
        if (observer) observer.disconnect();
      }
    };

    observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
    observer.observe(el);

    return () => {
      if (observer) observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [text, delay]);

  // Use dangerouslySetInnerHTML to render the spans
  return <span ref={elementRef} dangerouslySetInnerHTML={{ __html: displayText || text }} />;
};

export default TextScramble;
