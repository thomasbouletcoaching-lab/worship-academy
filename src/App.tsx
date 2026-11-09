import { HashRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { lazy, Suspense, useState, ReactNode } from 'react';
import Home from './pages/Home';
import Library from './pages/Library';
import FicheView from './pages/FicheView';

const Parcours = lazy(() => import('./pages/Parcours'));
const Outils = lazy(() => import('./pages/Outils'));
const Progres = lazy(() => import('./pages/Progres'));
const ExercisesPage = lazy(() => import('./features/exercises/ExercisesPage'));
const ChordDictionary = lazy(() => import('./features/chords/ChordDictionary'));
const NashvillePage = lazy(() => import('./features/nashville/NashvillePage'));
const VirtualBand = lazy(() => import('./features/band/VirtualBand'));
const SoundLab = lazy(() => import('./features/sons/SoundLab'));
const PadPage = lazy(() => import('./features/pad/PadPage'));
const FrequencesPage = lazy(() => import('./features/frequences/FrequencesPage'));
const EarTrainer = lazy(() => import('./features/ear/EarTrainer'));
const DimanchePage = lazy(() => import('./features/dimanche/DimanchePage'));
const CultePage = lazy(() => import('./features/culte/CultePage'));
const EglisePage = lazy(() => import('./features/eglise/EglisePage'));

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  return (
    <button
      type="button"
      aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/20"
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.toggle('dark', next);
        try { localStorage.setItem('wa-theme', next ? 'dark' : 'light'); } catch { /* stockage indisponible */ }
        setDark(next);
      }}
    >
      {dark ? '☀︎' : '☾'}
    </button>
  );
}

const TABS: [string, string, string][] = [
  ['/', '🏠', 'Accueil'],
  ['/parcours', '🧭', 'Parcours'],
  ['/bibliotheque', '📚', 'Fiches'],
  ['/entrainement', '🎹', 'S’entraîner'],
  ['/outils', '🧰', 'Outils'],
];

function Shell({ children }: { children: ReactNode }) {
  const link = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 ${isActive ? 'font-semibold text-or' : ''}`;
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <a href="#contenu" className="sr-only focus:not-sr-only">Aller au contenu</a>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-ivoire/90 backdrop-blur dark:border-white/10 dark:bg-nuit/90">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-auto font-serif text-lg font-semibold text-or">Worship Academy</Link>
          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Navigation principale">
            {TABS.slice(1).map(([to, , label]) => <NavLink key={to} to={to} className={link}>{label}</NavLink>)}
            <NavLink to="/progres" className={link}>Progrès</NavLink>
          </nav>
          <NavLink to="/progres" className="rounded-full px-2 py-1 text-sm md:hidden" aria-label="Progrès">📈</NavLink>
          <ThemeToggle />
        </div>
      </header>
      <main id="contenu" className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-ivoire/95 backdrop-blur dark:border-white/10 dark:bg-nuit/95 md:hidden" aria-label="Navigation mobile">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map(([to, icon, label]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'font-semibold text-or' : 'opacity-80'}`}>
                <span className="text-xl" aria-hidden>{icon}</span>{label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell>
        <Suspense fallback={<p className="opacity-60">Chargement…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/parcours" element={<Parcours />} />
            <Route path="/bibliotheque" element={<Library />} />
            <Route path="/fiche/:id" element={<FicheView />} />
            <Route path="/outils" element={<Outils />} />
            <Route path="/progres" element={<Progres />} />
            <Route path="/entrainement" element={<ExercisesPage />} />
            <Route path="/accords" element={<ChordDictionary />} />
            <Route path="/nashville" element={<NashvillePage />} />
            <Route path="/groupe" element={<VirtualBand />} />
            <Route path="/sons" element={<SoundLab />} />
            <Route path="/pad" element={<PadPage />} />
            <Route path="/frequences" element={<FrequencesPage />} />
            <Route path="/oreille" element={<EarTrainer />} />
            <Route path="/dimanche" element={<DimanchePage />} />
            <Route path="/culte" element={<CultePage />} />
            <Route path="/eglise" element={<EglisePage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </Shell>
    </HashRouter>
  );
}
