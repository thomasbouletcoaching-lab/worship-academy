import { useEffect, useMemo, useState, MouseEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fiches, ficheById, exerciseFor } from '../content';
import { renderMarkdown } from '../features/markdown/markdown';
import { Keyboard, rangeFor } from '../features/keyboard/keyboard';
import { playNotes, playSequence, SoundName } from '../audio/synth';
import { midiName } from '../theory/pitch';
import { getValides, setValide, getCards, gradeCard, Grade, isDue, logPractice } from '../lib/progress';

const SOUNDS: [SoundName, string][] = [['piano', 'Piano'], ['rhodes', 'Rhodes'], ['orgue', 'Orgue'], ['pad', 'Pad'], ['cordes', 'Cordes']];

export default function FicheView() {
  const { id = '' } = useParams();
  const f = ficheById.get(id);
  const [shown, setShown] = useState<number[]>([]);
  const [shift, setShift] = useState(0);
  const [sound, setSound] = useState<SoundName>('piano');
  const [valide, setValideState] = useState(() => getValides().includes(id));
  const [card, setCard] = useState(() => getCards()[id]);

  useEffect(() => {
    setShown([]);
    setShift(0);
    setValideState(getValides().includes(id));
    setCard(getCards()[id]);
    window.scrollTo(0, 0);
    logPractice('lecture', 0);
  }, [id]);

  const html = useMemo(() => (f ? renderMarkdown(f.body, { pitchButtons: true }) : ''), [f]);

  if (!f) return <p>Fiche introuvable. <Link to="/bibliotheque" className="text-or underline">Retour à la bibliothèque</Link></p>;

  const idx = fiches.indexOf(f);
  const prev = fiches[idx - 1];
  const next = fiches[idx + 1];
  const ex = exerciseFor(f);
  const notes = shown.map((m) => m + shift);
  const r = rangeFor(notes);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest('button.kb') as HTMLButtonElement | null;
    if (!btn) return;
    const midis = (btn.dataset.midis ?? '').split(',').map(Number).filter(Number.isFinite);
    setShown(midis);
    playNotes(midis.map((m) => m + shift), 1.8, 0, sound);
  };

  const toggleValide = () => {
    const v = !valide;
    setValide(id, v);
    setValideState(v);
    setCard(getCards()[id]);
  };
  const grade = (g: Grade) => { gradeCard(id, g); setCard(getCards()[id]); };
  const prereqs = f.prerequis.map((p) => ficheById.get(p)).filter(Boolean);

  return (
    <article className={`space-y-6 ${shown.length ? 'pb-72' : ''}`}>
      <Link to="/bibliotheque" className="text-sm text-or">← Bibliothèque</Link>
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide opacity-60">{f.module} · {f.section} · {Math.max(5, Math.round(f.mots / 180))} min de lecture</p>
        <h1 className="font-serif text-3xl font-semibold">{f.titre}</h1>
        {prereqs.length > 0 && (
          <p className="text-sm opacity-80">Prérequis : {prereqs.map((p, i) => <span key={p!.id}>{i ? ', ' : ''}<Link className="text-or underline" to={`/fiche/${p!.id}`}>{p!.titre}</Link></span>)}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link to={ex.path} className="rounded-xl bg-or px-4 py-2 text-sm font-semibold text-nuit">🎹 S’entraîner : {ex.label}</Link>
          <button type="button" onClick={toggleValide}
            className={`rounded-xl border px-4 py-2 text-sm ${valide ? 'border-sauge bg-sauge/20' : 'border-black/15 dark:border-white/20'}`}>
            {valide ? '✓ Fiche validée' : 'Marquer comme validée'}
          </button>
        </div>
        <p className="text-xs opacity-60">Astuce : touche 🎹 au bout d’une ligne pour voir les notes sur le clavier et les écouter.</p>
      </header>

      {valide && card && (
        <div className={`rounded-xl border p-3 text-sm ${isDue(card) ? 'border-or bg-or/10' : 'border-black/10 dark:border-white/10'}`}>
          <p>{isDue(card) ? 'Révision du jour : rejoue les exercices du palier 1, puis dis-nous comment ça s’est passé.' : `Prochaine révision le ${new Date(card.due + 'T12:00:00').toLocaleDateString('fr-FR')}.`}</p>
          {isDue(card) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {(['difficile', 'moyen', 'facile'] as Grade[]).map((g) => (
                <button key={g} type="button" onClick={() => grade(g)} className="rounded-lg border border-black/15 px-3 py-1.5 capitalize dark:border-white/20">{g}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="prose-fiche" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />

      <nav className="flex justify-between gap-3 border-t border-black/10 pt-4 text-sm dark:border-white/10">
        {prev ? <Link to={`/fiche/${prev.id}`} className="text-or">← {prev.titre}</Link> : <span />}
        {next ? <Link to={`/fiche/${next.id}`} className="text-right text-or">{next.titre} →</Link> : <span />}
      </nav>

      {shown.length > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-20 border-t border-black/10 bg-ivoire/95 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-nuit/95 md:bottom-0">
          <div className="mx-auto max-w-5xl space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono">{notes.map((m) => midiName(m, true)).join(' ')}</span>
              <span className="opacity-60">{shift ? `(transposé de ${shift > 0 ? '+' : ''}${shift} demi-ton${Math.abs(shift) > 1 ? 's' : ''})` : ''}</span>
              <span className="ml-auto flex flex-wrap gap-1">
                <button type="button" aria-label="Transposer d’un demi-ton plus bas" className="rounded-lg border border-black/15 px-3 py-1 dark:border-white/20" onClick={() => setShift((s) => s - 1)}>−½</button>
                <button type="button" aria-label="Transposer d’un demi-ton plus haut" className="rounded-lg border border-black/15 px-3 py-1 dark:border-white/20" onClick={() => setShift((s) => s + 1)}>+½</button>
                <button type="button" className="rounded-lg border border-black/15 px-3 py-1 dark:border-white/20" onClick={() => playNotes(notes, 1.8, 0, sound)}>▶ Accord</button>
                <button type="button" className="rounded-lg border border-black/15 px-3 py-1 dark:border-white/20" onClick={() => playSequence([...notes].sort((a, b) => a - b), 0.35, 0.8, sound)}>Arpège</button>
                <select aria-label="Son" value={sound} onChange={(e) => setSound(e.target.value as SoundName)} className="rounded-lg border border-black/15 bg-transparent px-2 py-1 dark:border-white/20 dark:bg-nuit">
                  {SOUNDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <button type="button" aria-label="Fermer le clavier" className="rounded-lg px-3 py-1" onClick={() => setShown([])}>✕</button>
              </span>
            </div>
            <Keyboard from={r.from} octaves={r.octaves} active={notes} showNames onKey={(m) => playNotes([m], 0.8, 0, sound)} height={100} />
          </div>
        </div>
      )}
    </article>
  );
}
