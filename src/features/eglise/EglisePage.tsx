import { useState } from 'react';
import { Link } from 'react-router-dom';
import { repo } from '../../lib/repository';
import { decodeProgress, exportProgress, SharedProgress } from '../../lib/progress';
import { fiches, GROUPES } from '../../content';
import { getSet, encodeSet } from '../dimanche/set';

// Espace église (maquette fonctionnelle locale) : rien ne quitte l'appareil, on échange des codes.
interface Member { id: string; nom: string; instrument: string; progress?: SharedProgress; importedAt?: string; }
const KEY = 'wa-equipe';
const input = 'rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit';

export default function EglisePage() {
  const [team, setTeam] = useState<Member[]>(() => repo().get<Member[]>(KEY, []));
  const [nom, setNom] = useState('');
  const [instrument, setInstrument] = useState('Piano');
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [myName, setMyName] = useState(() => repo().get('wa-moi', ''));
  const [msg, setMsg] = useState('');
  const save = (t: Member[]) => { setTeam(t); repo().set(KEY, t); };
  const copy = async (text: string, ok: string) => {
    try { await navigator.clipboard.writeText(text); setMsg(ok); } catch { setMsg(`Copie impossible ; voici le code : ${text}`); }
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Espace église</h1>
        <p className="text-sm opacity-80">
          Le responsable louange suit son équipe et partage le set. Version locale : chaque musicien envoie son code de progression,
          le responsable l’importe ici. Aucune donnée n’est envoyée sur internet.
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="font-semibold">Je suis musicien : partager ma progression</h2>
        <div className="flex flex-wrap gap-2">
          <input aria-label="Mon prénom" placeholder="Mon prénom" value={myName} onChange={(e) => { setMyName(e.target.value); repo().set('wa-moi', e.target.value); }} className={input} />
          <button type="button" disabled={!myName} className="rounded-lg bg-or px-3 py-2 text-sm font-semibold text-nuit disabled:opacity-40" onClick={() => copy(exportProgress(myName), 'Code copié : envoie-le à ton responsable louange.')}>Copier mon code</button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-or">Mon équipe ({team.length})</h2>
        <div className="flex flex-wrap gap-2">
          <input aria-label="Nom" placeholder="Prénom" value={nom} onChange={(e) => setNom(e.target.value)} className={input} />
          <select aria-label="Instrument" value={instrument} onChange={(e) => setInstrument(e.target.value)} className={input}>
            {['Piano', 'Claviers / pads', 'Guitare', 'Basse', 'Batterie', 'Chant', 'Technique son'].map((i) => <option key={i}>{i}</option>)}
          </select>
          <button type="button" disabled={!nom.trim()} className="rounded-lg border border-black/15 px-3 py-2 text-sm disabled:opacity-40 dark:border-white/20"
            onClick={() => { save([...team, { id: Date.now().toString(36), nom: nom.trim(), instrument }]); setNom(''); }}>+ Ajouter</button>
        </div>
        <ul className="space-y-3">
          {team.map((m) => {
            const v = new Set(m.progress?.valides ?? []);
            const last = m.progress?.log?.slice(-1)[0]?.date;
            const exOk = m.progress?.ex?.filter((e) => e.reussi).length ?? 0;
            return (
              <li key={m.id} className="space-y-2 rounded-xl border border-black/10 p-3 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{m.nom}</p><span className="text-sm opacity-70">· {m.instrument}</span>
                  <button type="button" className="ml-auto text-sm opacity-70" onClick={() => window.confirm(`Retirer ${m.nom} ?`) && save(team.filter((x) => x.id !== m.id))}>Retirer</button>
                </div>
                {m.progress ? (
                  <div className="grid gap-1 text-sm sm:grid-cols-2">
                    {GROUPES.map((g) => {
                      const items = fiches.filter((f) => f.groupe === g.n);
                      const n = items.filter((f) => v.has(f.id)).length;
                      return <p key={g.n}>{g.court} : <strong>{n}/{items.length}</strong></p>;
                    })}
                    <p>Exercices réussis (récents) : <strong>{exOk}</strong></p>
                    <p>Dernière activité : <strong>{last ?? '—'}</strong> (code importé le {m.importedAt})</p>
                  </div>
                ) : <p className="text-sm opacity-70">Pas encore de progression importée.</p>}
                <div className="flex flex-wrap gap-2">
                  <input aria-label={`Code de ${m.nom}`} placeholder="Colle son code de progression…" value={codes[m.id] ?? ''} onChange={(e) => setCodes({ ...codes, [m.id]: e.target.value })} className={`${input} min-w-0 flex-1 text-sm`} />
                  <button type="button" className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20" onClick={() => {
                    const p = decodeProgress(codes[m.id] ?? '');
                    if (!p) { setMsg('Code de progression invalide.'); return; }
                    save(team.map((x) => (x.id === m.id ? { ...x, progress: p, importedAt: new Date().toLocaleDateString('fr-FR') } : x)));
                    setCodes({ ...codes, [m.id]: '' }); setMsg(`Progression de ${m.nom} mise à jour.`);
                  }}>Importer</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-2 rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="font-semibold">Partager le set du dimanche</h2>
        <p className="text-sm opacity-80">Prépare le set dans <Link to="/dimanche" className="text-or underline">Prêt pour dimanche</Link> (grilles liées comprises), puis envoie le code à l’équipe : chacun l’importe et reçoit son plan de 7 jours.</p>
        <button type="button" className="rounded-lg bg-or px-3 py-2 text-sm font-semibold text-nuit" onClick={() => copy(encodeSet(getSet()), 'Code du set copié : envoie-le à l’équipe.')}>Copier le code du set</button>
      </div>
      {msg && <p role="status" className="break-all text-sm">{msg}</p>}
    </section>
  );
}
