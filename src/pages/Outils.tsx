import { Link } from 'react-router-dom';

const OUTILS: [string, string, string][] = [
  ['/entrainement', '🎹 S’entraîner', 'Exercices validés au clavier MIDI ou au micro : justesse, rythme en ms, régularité du toucher.'],
  ['/accords', '📖 Dictionnaire d’accords', 'Tout accord, toute tonalité, tous les voicings, et le voice leading vers l’accord suivant.'],
  ['/nashville', '🔢 Grilles Nashville', 'Écris tes grilles en chiffres, transpose en un geste, garde ton répertoire.'],
  ['/groupe', '🥁 Groupe virtuel', 'Batterie, basse, pad et cordes suivent ta grille. Coupe un instrument pour entendre sa place.'],
  ['/sons', '🎛 Orgue et labo de sons', 'Orgue à tirettes avec Leslie ; compare piano, Rhodes, orgue, pad et cordes.'],
  ['/pad', '🌫 Pad de louange', 'Nappe tenue pour la prière, changement d’accord en fondu.'],
  ['/frequences', '📊 Fréquences', 'Où se placent la basse, ta main gauche, tes voicings et la voix.'],
  ['/oreille', '👂 Oreille', 'Intervalles, qualités d’accords, degrés, mouvements de basse, modulations.'],
  ['/dimanche', '📅 Prêt pour dimanche', 'Ton set, un plan sur 7 jours et un test final.'],
  ['/culte', '🙏 Moments de culte', 'Prière, appel, cène, offrande, spontané : pratique l’accompagnement adapté.'],
  ['/eglise', '⛪ Espace église', 'Le responsable louange suit l’équipe et partage le set.'],
  ['/progres', '📈 Progrès', 'Statistiques, série de jours, notions fragiles.'],
];

export default function Outils() {
  return (
    <section className="space-y-5">
      <h1 className="font-serif text-2xl font-semibold">Outils</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {OUTILS.map(([to, t, d]) => (
          <li key={to}>
            <Link to={to} className="block h-full rounded-2xl border border-black/10 p-4 hover:border-or dark:border-white/10">
              <p className="font-semibold">{t}</p>
              <p className="text-sm opacity-75">{d}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
