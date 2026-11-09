// Test de bout en bout (Playwright) sur le build de production servi par `vite preview`.
// Usage : npm run build && npx vite preview --port 4173 & node scripts/e2e.cjs
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173/worship-academy/';
// Route → début du titre attendu (les pages sont chargées à la demande : on attend le bon titre).
const ROUTES = {
  '': 'Accompagner la louange', parcours: 'Mon parcours', bibliotheque: 'Bibliothèque', 'fiche/v-drop2': 'Drop 2',
  'fiche/b-triades': 'Triades', outils: 'Outils', progres: 'Progrès', entrainement: 'S’entraîner', accords: 'Dictionnaire',
  nashville: 'Grilles en Nashville', groupe: 'Groupe virtuel', sons: 'Orgue et labo', pad: 'Pad de louange',
  frequences: 'Où se place', oreille: 'Entraîneur d’oreille', dimanche: 'Prêt pour dimanche', culte: 'Simulateur', eglise: 'Espace église',
};
async function open(page, route) {
  await page.goto(BASE + '#/' + route, { waitUntil: 'networkidle' });
  const want = ROUTES[route.split('?')[0]];
  if (want) await page.waitForFunction((w) => document.querySelector('h1')?.textContent?.startsWith(w), want, { timeout: 8000 }).catch(() => {});
}

let failures = 0;
const check = (ok, label) => { console.log(`${ok ? '✓' : '✗'} ${label}`); if (!ok) failures++; };

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM, args: ['--no-sandbox'] } : {});
  for (const vp of [{ name: 'ordinateur', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Future Flag/.test(m.text())) errors.push(m.text()); });
    for (const r of Object.keys(ROUTES)) {
      await open(page, r);
      const h1 = await page.locator('h1').first().textContent({ timeout: 5000 }).catch(() => null);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      check(!!h1 && h1.startsWith(ROUTES[r]) && !overflow, `[${vp.name}] #/${r} → ${h1 ?? 'pas de titre'}${overflow ? ' (débordement horizontal)' : ''}`);
    }
    check(errors.length === 0, `[${vp.name}] aucune erreur JavaScript${errors.length ? ' : ' + errors.slice(0, 3).join(' | ') : ''}`);
    await page.close();
  }

  // Parcours clés.
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // 1. Bibliothèque : recherche.
  await open(p, 'bibliotheque');
  await p.fill('input[type=search]', 'drop 2');
  const n = await p.locator('a[href^="#/fiche/"]').count();
  check(n > 0, `recherche « drop 2 » : ${n} fiche(s)`);
  // 2. Fiche : bouton clavier et validation.
  await open(p, 'fiche/v-drop2');
  const kb = p.locator('button.kb').first();
  check(await kb.count() > 0, 'la fiche Drop 2 contient des boutons clavier 🎹');
  await kb.click();
  check(await p.locator('text=Transposer').count() + await p.locator('[aria-label="Transposer d’un demi-ton plus haut"]').count() > 0, 'le clavier de la fiche s’ouvre');
  await p.click('text=Marquer comme validée');
  check(await p.locator('text=Fiche validée').count() === 1, 'validation de la fiche');
  // 3. Progrès reflète la validation.
  await open(p, 'progres');
  check((await p.textContent('main')).includes('Fiches validées'), 'page Progrès');
  // 4. Exercice d'accord au clavier à l'écran : on joue l'accord demandé.
  await open(p, 'entrainement?type=accords&palier=1');
  const label = (await p.locator('p.font-serif').first().textContent()).trim();
  const pcs = await p.evaluate((l) => {
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const m = /^([A-G])(#|b)?(m)?$/.exec(l);
    const r = (base[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
    return [r, (r + (m[3] ? 3 : 4)) % 12, (r + 7) % 12];
  }, label);
  // Le clavier commence à C3 (MIDI 48) : on clique les touches 60 + pc (octave 4) via le SVG.
  for (const pc of pcs) await p.evaluate((midi) => {
    const svg = document.querySelector('main svg');
    const groups = [...svg.querySelectorAll('g')];
    // Touches blanches puis noires, dans l'ordre MIDI : on reconstruit l'index.
    const BLACK = [1, 3, 6, 8, 10];
    const whites = []; for (let m = 48; m < 84; m++) if (!BLACK.includes(m % 12)) whites.push(m);
    const blacks = whites.map((m) => m + 1).filter((m) => BLACK.includes(m % 12) && m < 84);
    const idx = BLACK.includes(midi % 12) ? whites.length + blacks.indexOf(midi) : whites.indexOf(midi);
    groups[idx].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  }, 60 + pc);
  await p.click('text=Valider');
  check(await p.locator('text=Réussi').count() > 0, `exercice d’accord ${label} validé au clavier à l’écran`);
  // 5. Grille Nashville : transposition.
  await open(p, 'nashville');
  const before = await p.locator('h2.font-serif').textContent();
  await p.click('[aria-label="Un demi-ton plus haut"]');
  const after = await p.locator('h2.font-serif').textContent();
  check(before !== after, `transposition de grille : « ${before} » → « ${after} »`);
  // 6. Oreille : une question et une réponse.
  await open(p, 'oreille');
  await p.click('text=Commencer');
  await p.locator('main .grid button').last().click();
  check(await p.locator('[role=status]').count() === 1, 'entraîneur d’oreille : réponse corrigée');
  // 7. Fréquences : diagnostic.
  await open(p, 'frequences');
  await p.selectOption('select[aria-label=Situation]', '1');
  check((await p.textContent('main')).includes('double la basse'), 'fréquences : détecte la main gauche qui double la basse');

  await browser.close();
  console.log(failures ? `\n${failures} échec(s).` : '\nTout est vert.');
  process.exit(failures ? 1 : 0);
})();
