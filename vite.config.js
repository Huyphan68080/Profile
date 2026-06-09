import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const base = isGithubActions && repositoryName ? `/${repositoryName}/` : '/';

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    // Force a single React instance — fixes R3F "__SECRET_INTERNALS" error
    dedupe: ['react', 'react-dom', '@react-three/fiber'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
          vendor: ['react', 'react-dom', 'framer-motion'],
        },
      },
    },
  },
});
