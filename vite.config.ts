import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

/** Génère dist/sw.js avec la liste complète des fichiers du build (hors ligne complet). */
function serviceWorker(): Plugin {
  return {
    name: 'wa-service-worker',
    apply: 'build',
    closeBundle() {
      const dist = join(process.cwd(), 'dist');
      const walk = (d: string): string[] => readdirSync(d).flatMap((f) => {
        const p = join(d, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      });
      const files = walk(dist).map((p) => relative(dist, p).split('\\').join('/')).filter((f) => f !== 'sw.js' && !f.endsWith('.map'));
      const hash = createHash('sha256');
      for (const f of files.sort()) hash.update(f).update(readFileSync(join(dist, f)));
      const precache = JSON.stringify(['./', ...files.filter((f) => f !== 'index.html'), 'index.html']);
      const sw = readFileSync(join(process.cwd(), 'sw.template.js'), 'utf8')
        .replaceAll('__VERSION__', hash.digest('hex').slice(0, 12))
        .replaceAll('__PRECACHE__', precache);
      writeFileSync(join(dist, 'sw.js'), sw);
    },
  };
}

// Déploiement GitHub Pages : base = /<nom-du-dépôt>/.
export default defineConfig({
  plugins: [react(), serviceWorker()],
  base: '/worship-academy/',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
  },
});
