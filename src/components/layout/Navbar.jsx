import { motion } from 'framer-motion';
import { FiEye } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { profile } from '../../data/siteData';

const Navbar = ({ viewCount, navItems = [], activeSection, onNavigate }) => {
  const [localActive, setLocalActive] = useState(activeSection);

  useEffect(() => {
    setLocalActive(activeSection);
  }, [activeSection]);

  const handleClick = (e, frameId) => {
    e.preventDefault();
    setLocalActive(frameId);
    onNavigate?.(frameId);

    const target = document.getElementById(frameId);
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
  };

  return (
    <header className="fixed inset-x-0 top-1.5 z-50 px-1.5 sm:top-2 sm:px-4">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="nav-shell mx-auto w-fit rounded-full px-3 py-1.5 shadow-glass sm:px-4 sm:py-1.5"
      >
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:gap-3">
          <a
            id="nav-brand-link"
            href="#hero"
            onClick={(e) => handleClick(e, 'hero')}
            className="nav-brand cyber-title rounded-full px-2.5 py-1 text-[13.5px] sm:px-3 sm:py-1.5 sm:text-[15.5px] inline-flex items-center justify-center"
          >
            {profile.brand}
          </a>

          <ul className="hidden items-center justify-center gap-2 xl:flex">
            {navItems.map((item) => {
              const frameId = item.href.replace('#', '');
              const isActive = localActive === frameId;

              return (
                <li key={item.href}>
                  <a
                    id={`nav-link-${frameId}`}
                    href={item.href}
                    onClick={(e) => handleClick(e, frameId)}
                    className={`nav-link inline-flex items-center justify-center ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              id="nav-views-link"
              href="#ip-check"
              onClick={(e) => handleClick(e, 'ip-check')}
              className="nav-views inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[13.5px] sm:px-4 sm:py-1.5 sm:text-[15.5px]"
              aria-label="Open visitor stats"
            >
              <FiEye className="text-xs sm:text-sm" />
              <span>{typeof viewCount === 'number' ? viewCount.toLocaleString() : '--'}</span>
            </a>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-6 gap-0.5 pb-0 xl:hidden">
          {navItems.map((item) => {
            const frameId = item.href.replace('#', '');
            const isActive = localActive === frameId;

            return (
              <a
                key={item.href}
                id={`nav-link-mobile-${frameId}`}
                href={item.href}
                onClick={(e) => handleClick(e, frameId)}
                className={`nav-link-mobile inline-flex items-center justify-center ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </motion.nav>
    </header>
  );
};

export default Navbar;
