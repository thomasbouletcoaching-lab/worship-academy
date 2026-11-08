import { HashRouter, Routes, Route, NavLink, Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { loadFiches, Fiche } from './content/loader';
import { renderMarkdown } from './features/markdown/markdown';
import ChordDictionary from './features/chords/ChordDictionary';
import NashvillePage from './features/nashville/NashvillePage';
import EarTrainer from './features/ear/EarTrainer';
import VirtualBand from './features/band/VirtualBand';

const fiches = loadFiches();
const NIVEAUX = [
  { n: 1, nom: 'Niveau 1 · Servir' },
  { n: 2, nom: 'Niveau 2 · Enrichir' },
  { n: 3, nom: 'Niveau 3 · Maîtriser' },
  { n: 0, nom: 'Transversal' },
];

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  return (
    <button
      type="button"
      aria-label="Changer de thème"
      className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/20"
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.toggle('dark', next);
        try {
          localStorage.setItem('wa-theme', next ? 'dark' : 'light');
        } catch {
          /* stockage indisponible */
        }
        setDark(next);
      }}
    >
      {dark ? '☀︎ Clair' : '☾ Sombre'}
    </button>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const link = 'px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10';
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-ivoire/90 backdrop-blur dark:border-white/10 dark:bg-nuit/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-auto font-serif text-lg font-semibold text-or">Worship Academy</Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <NavLink to="/bibliotheque" className={({ isActive }) => `${link} ${isActive ? 'font-semibold' : ''}`}>Bibliothèque</NavLink>
            <NavLink to="/accords" className={({ isActive }) => `${link} ${isActive ? 'font-semibold' : ''}`}>Accords</NavLink>
            <NavLink to="/nashville" className={({ isActive }) => `${link} ${isActive ? 'font-semibold' : ''}`}>Grilles</NavLink>
            <NavLink to="/groupe" className={({ isActive }) => `${link} ${isActive ? 'font-semibold' : ''}`}>Groupe</NavLink>
            <NavLink to="/oreille" className={({ isActive }) => `${link} ${isActive ? 'font-semibold' : ''}`}>Oreille</NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

function Home() {
  return (
    <section className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Accompagner la louange au piano, en autonomie.</h1>
      <p className="max-w-2xl leading-relaxed">
        Une méthode en trois niveaux, pensée pour les chrétiens qui veulent servir par la musique : comprendre
        l'harmonie, s'entraîner au clavier, et appliquer sur des chants de louange.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/bibliotheque" className="rounded-lg bg-or px-4 py-2 font-semibold text-nuit">Ouvrir la bibliothèque</Link>
        <Link to="/accords" className="rounded-lg border border-black/15 px-4 py-2 dark:border-white/20">Dictionnaire d'accords</Link>
      </div>
      <p className="text-sm opacity-70">{fiches.length} fiche(s) disponibles.</p>
    </section>
  );
}

function Library() {
  const groups = useMemo(() => NIVEAUX.map((g) => ({ ...g, items: fiches.filter((f) => (g.n === 0 ? f.niveau === 0 : f.niveau === g.n)) })), []);
  return (
    <section className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold">Bibliothèque</h1>
      {fiches.length === 0 && <p className="opacity-70">Les premières fiches arrivent bientôt.</p>}
      {groups.filter((g) => g.items.length).map((g) => (
        <div key={g.n}>
          <h2 className="mb-3 text-lg font-semibold text-or">{g.nom}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {g.items.map((f) => (
              <li key={f.id}>
                <Link to={`/fiche/${f.id}`} className="block rounded-lg border border-black/10 p-3 hover:border-or dark:border-white/10">
                  <span className="block text-xs opacity-60">{f.module} · {f.categorie}</span>
                  <span className="font-medium">{f.titre}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function FicheView() {
  const { id } = useParams();
  const f: Fiche | undefined = fiches.find((x) => x.id === id);
  if (!f) return <p>Fiche introuvable. <Link to="/bibliotheque" className="text-or underline">Retour à la bibliothèque</Link></p>;
  const idx = fiches.indexOf(f);
  const prev = fiches[idx - 1];
  const next = fiches[idx + 1];
  return (
    <article className="space-y-6">
      <Link to="/bibliotheque" className="text-sm text-or">← Bibliothèque</Link>
      <header>
        <p className="text-xs uppercase tracking-wide opacity-60">{f.module} · {f.niveauNom} · {f.categorie}</p>
        <h1 className="font-serif text-3xl font-semibold">{f.titre}</h1>
      </header>
      <div className="prose-fiche" dangerouslySetInnerHTML={{ __html: renderMarkdown(f.body) }} />
      <nav className="flex justify-between gap-3 border-t border-black/10 pt-4 text-sm dark:border-white/10">
        {prev ? <Link to={`/fiche/${prev.id}`} className="text-or">← {prev.titre}</Link> : <span />}
        {next ? <Link to={`/fiche/${next.id}`} className="text-right text-or">{next.titre} →</Link> : <span />}
      </nav>
    </article>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bibliotheque" element={<Library />} />
          <Route path="/fiche/:id" element={<FicheView />} />
          <Route path="/accords" element={<ChordDictionary />} />
          <Route path="/nashville" element={<NashvillePage />} />
          <Route path="/oreille" element={<EarTrainer />} />
          <Route path="/groupe" element={<VirtualBand />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Shell>
    </HashRouter>
  );
}
