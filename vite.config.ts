import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Déploiement GitHub Pages : base = /<nom-du-dépôt>/ en production.
export default defineConfig({
  plugins: [react()],
  base: '/worship-acaemy/',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
  },
});
