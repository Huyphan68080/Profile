import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import RippleButton from '../common/RippleButton';

const isValidHttpUrl = (value) => {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const getPreviewSources = (project) => {
  const sources = [];
  const imageValue = typeof project.image === 'string' ? project.image.trim() : '';
  const hrefValue = typeof project.href === 'string' ? project.href.trim() : '';

  if (isValidHttpUrl(imageValue)) {
    sources.push(imageValue);
  }

  if (isValidHttpUrl(hrefValue)) {
    const encodedUrl = encodeURIComponent(hrefValue);
    sources.push(`https://image.thum.io/get/width/960/noanimate/${hrefValue}`);
    sources.push(`https://s.wordpress.com/mshots/v1/${encodedUrl}?w=960`);
  }

  return Array.from(new Set(sources));
};

const ProjectCard = ({ project, index }) => {
  const [isTouchLayout, setIsTouchLayout] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  });
  const hrefValue = typeof project.href === 'string' ? project.href.trim() : '';
  const hasLiveDemo = hrefValue !== '#' && isValidHttpUrl(hrefValue);
  const previewSources = useMemo(() => getPreviewSources(project), [project.href, project.image]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = previewSources[previewIndex] || '';

  useEffect(() => {
    setPreviewIndex(0);
    setImageFailed(false);
  }, [project.href, project.image, project.title]);

  useEffect(() => {
    const interactionQuery = window.matchMedia('(max-width: 768px), (pointer: coarse)');

    const syncLayoutMode = () => {
      setIsTouchLayout(interactionQuery.matches);
    };

    syncLayoutMode();

    if (interactionQuery.addEventListener) {
      interactionQuery.addEventListener('change', syncLayoutMode);
    } else {
      interactionQuery.addListener(syncLayoutMode);
    }

    return () => {
      if (interactionQuery.addEventListener) {
        interactionQuery.removeEventListener('change', syncLayoutMode);
      } else {
        interactionQuery.removeListener(syncLayoutMode);
      }
    };
  }, []);

  return (
    <motion.article
      whileHover={isTouchLayout ? undefined : { y: -1 }}
      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel group relative h-full rounded-[1rem] border border-zinc-200 p-2.5"
    >
      <div
        className={`absolute inset-0 -z-10 rounded-[1rem] bg-gradient-to-br ${project.accentClass} opacity-[0.14] blur-sm transition duration-150 group-hover:opacity-[0.18]`}
      />
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400/10 to-transparent" />

      {imageSrc && !imageFailed ? (
        hasLiveDemo ? (
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="group/preview relative block overflow-hidden rounded-[0.7rem] border border-zinc-200 cursor-pointer"
            aria-label={`Open ${project.title}`}
          >
            <img
              src={imageSrc}
              alt={`${project.title} preview`}
              loading="lazy"
              decoding="async"
              className="aspect-[2/1] w-full object-cover transition duration-200 group-hover/preview:scale-[1.01]"
              onError={() => {
                if (previewIndex < previewSources.length - 1) {
                  setPreviewIndex((current) => current + 1);
                  return;
                }
                setImageFailed(true);
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </a>
        ) : (
          <div
            className="group/preview relative block overflow-hidden rounded-[0.7rem] border border-zinc-200 cursor-default"
            aria-label={`${project.title} preview`}
          >
            <img
              src={imageSrc}
              alt={`${project.title} preview`}
              loading="lazy"
              decoding="async"
              className="aspect-[2/1] w-full object-cover transition duration-200 group-hover/preview:scale-[1.01]"
              onError={() => {
                if (previewIndex < previewSources.length - 1) {
                  setPreviewIndex((current) => current + 1);
                  return;
                }
                setImageFailed(true);
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )
      ) : (
        <div className="flex aspect-[2/1] items-center justify-center rounded-[0.7rem] border border-zinc-200 bg-zinc-400/5 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          Preview Coming Soon
        </div>
      )}

      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <p className="cyber-title text-[10px] uppercase tracking-[0.24em] text-zinc-500">Project {index + 1}</p>
          <h3 className="mt-1 text-[1.15rem] font-semibold leading-tight text-zinc-900">{project.title}</h3>
        </div>
        {hasLiveDemo ? (
          <span className="rounded-full border border-emerald-500/14 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-emerald-600">
            Live
          </span>
        ) : null}
      </div>

      <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-relaxed text-zinc-700 sm:text-[15.5px]">{project.description}</p>

      <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-zinc-200 bg-black/[0.02] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-zinc-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-2">
        <RippleButton
          href={hasLiveDemo ? project.href : undefined}
          external={hasLiveDemo}
          className="min-h-0 border-zinc-200 bg-black/[0.03] px-2.5 py-1 text-[12.5px] uppercase tracking-[0.14em] text-zinc-800"
        >
          {hasLiveDemo ? 'Open Project' : 'Coming Soon'}
        </RippleButton>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
