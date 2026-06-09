import { FaFigma, FaGitAlt } from 'react-icons/fa';
import { SiHtml5, SiGithub, SiCss3, SiTailwindcss, SiThreedotjs, SiTypescript, SiVite, SiJavascript, SiReact, SiNodedotjs, SiMongodb } from 'react-icons/si';

export const profile = {
  brand: 'Sun',
  name: 'Huy Phan',
  role: 'Fullstack Developer',
  kicker: 'Overview',
  typewriterText: 'Architecting scalable systems.',
  headline:
    'Designing elegant system architectures. Engineering robust backend infrastructures with minimalist precision.',
};

export const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'IP Check', href: '#ip-check' },
  { label: 'Contact', href: '#contact' },
];

export const aboutParagraphs = [
  'I bridge the gap between heavy-duty engineering and minimalist spatial design. I build high-throughput backend services and translate them into fluid, responsive interfaces.',
  'My workflow optimizes database queries, scales API pipelines, and crafts clean component architectures to deliver maximum performance at every tier.',
];

export const aboutStats = [
  { label: 'System Uptime', value: '100%' },
  { label: 'APIs Integrated', value: '12+' },
  { label: 'Lighthouse Performance', value: '98/100' },
];

export const skills = [
  { name: 'JavaScript', level: 92, icon: SiJavascript, color: 'text-zinc-600' },
  { name: 'React', level: 88, icon: SiReact, color: 'text-zinc-600' },
  { name: 'Nodejs', level: 90, icon: SiNodedotjs, color: 'text-zinc-600' },
  { name: 'MongoDB', level: 86, icon: SiMongodb, color: 'text-zinc-600' },
  { name: 'TailwindCSS', level: 94, icon: SiTailwindcss, color: 'text-zinc-600' },
  { name: 'Html5', level: 96, icon: SiHtml5, color: 'text-zinc-600' },
  { name: 'Css', level: 92, icon: SiCss3, color: 'text-zinc-600' },
  { name: 'Github', level: 88, icon: SiGithub, color: 'text-zinc-600' },
];

export const projects = [
  {
    title: 'Note Web',
    description:
      'A minimalist markdown workspace with keyboard-driven commands and immediate client-side data persistence.',
    tags: ['React', 'JavaScript', 'HTML', 'CSS'],
    href: 'https://huyphan68080.github.io/noteweb.github.io/',
    accentClass: 'from-zinc-500/20 via-zinc-400/15 to-zinc-600/20',
  },
  {
    title: 'Student Manager',
    description:
      'Fullstack student records dashboard managing relational APIs, search caching, and nested database schema operations.',
    tags: ['React', 'Vite', 'TailwindCSS', 'Node.js', 'Express', 'MongoDB', 'Render'],
    href: 'https://huyphan68080.github.io/Quanlyhs.github.io/',
    accentClass: 'from-zinc-600/20 via-zinc-300/15 to-zinc-500/20',
  },
];

export const contactMeta = {
  email: 'Huyphan68080@gmail.com',
  location: 'Ho Chi Minh City, Vietnam',
  availability: 'Open for scalable fullstack architecture and design opportunities',
};

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/huyphan68080' },
  { label: 'Facebook', href: 'https://www.facebook.com/hphan.media.vn' },
  { label: 'Discord', href: 'https://discord.com/users/1043123309983846482' },
];

export const integrations = {
  discordUserId: '1043123309983846482',
  enableGlobalViewCounter: false,
};

export const experienceTimeline = [
  {
    year: '2025 - Present',
    role: 'Fullstack Developer',
    company: 'Freelance & Open Source',
    description: 'Engineering API architectures, modeling databases, and crafting WebGL background canvases.'
  },
  {
    year: '2023 - 2024',
    role: 'Frontend UI Engineer',
    company: 'Digital Studio',
    description: 'Built high-fidelity reactive layout systems, custom shaders, and optimized asset delivery pipelines.'
  },
  {
    year: '2022',
    role: 'Systems Developer Student',
    company: 'Self-Directed Study',
    description: 'Mastered memory models, HTTP protocol structures, relational databases, and MVC architectures.'
  }
];

export const skillCategories = [
  {
    title: 'Client-Side Architecture',
    desc: 'Crafting responsive, performance-aware web interfaces and modular components.',
    items: ['Html5', 'Css', 'TailwindCSS', 'JavaScript', 'React']
  },
  {
    title: 'Server & Database Infrastructure',
    desc: 'Designing fast APIs, relational schemas, and highly secure routing tables.',
    items: ['Nodejs', 'MongoDB']
  },
  {
    title: 'DevOps & Tooling',
    desc: 'Managing automated deployments, repository versions, and dependency structures.',
    items: ['Github']
  }
];
