import { useState } from 'react';

// Simulateur de moments de culte : consignes d'accompagnement pour chaque moment.
const MOMENTS = [
  {
    id: 'priere',
    nom: 'Prière',
    dynamique: 'Très doux, pp. Nappe tenue, peu de mouvement.',
    consignes: ['Pad ou accord tenu, sans rythme', 'Reste sur un accord de tonique ou de sous-dominante', 'Laisse des silences : la prière respire'],
    erreur: 'Ajouter des fills pendant la prière des fidèles.',
  },
  {
    id: 'appel',
    nom: 'Appel',
    dynamique: 'Crescendo progressif, du mf au f.',
    consignes: ['Commence par des accords simples, ajoute les extensions quand l\'appel monte', 'Donne le départ du chant de réponse', 'Ralentis légèrement pour laisser la parole'],
    erreur: 'Monter trop vite : garde de la marge pour le dernier refrain.',
  },
  {
    id: 'cene',
    nom: 'Sainte cène',
    dynamique: 'Recueilli, p à mp. Reste discret.',
    consignes: ['Jeu en accords tenus, mains légères', 'Attends le signal du pasteur pour commencer et pour finir', 'Ne couvre jamais la parole'],
    erreur: 'Jouer comme pour un concert : ici la musique accompagne le recueillement.',
  },
  {
    id: 'offrande',
    nom: 'Offrande',
    dynamique: 'Modéré, mf. Simple et régulier.',
    consignes: ['Une grille simple, en boucle, sans changer de tonalité', 'Prépare la fin pour qu\'elle tombe bien avec l\'annonce'],
    erreur: 'Improviser longuement quand on attend la fin.',
  },
  {
    id: 'spontane',
    nom: 'Temps spontané',
    dynamique: 'Suit l\'Esprit : le volume et la densité suivent la conduite du chanteur.',
    consignes: ['Écoute avant de jouer', 'Reste dans un accord tant que rien ne change', 'Quand la conduite change, suis-la plutôt que de la devancer'],
    erreur: 'Remplir le silence par réflexe.',
  },
];

export default function CultePage() {
  const [id, setId] = useState(MOMENTS[0].id);
  const m = MOMENTS.find((x) => x.id === id)!;
  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Simulateur de moments de culte</h1>
      <p className="max-w-2xl text-sm opacity-80">Choisis un moment du service : l'app te donne l'attitude musicale à tenir.</p>
      <div className="flex flex-wrap gap-2">
        {MOMENTS.map((x) => (
          <button key={x.id} type="button" onClick={() => setId(x.id)} className={`rounded-lg border px-3 py-1 text-sm ${x.id === id ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{x.nom}</button>
        ))}
      </div>
      <article className="space-y-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-semibold text-or">{m.nom}</h2>
        <p className="text-sm"><strong>Dynamique :</strong> {m.dynamique}</p>
        <ul className="list-disc space-y-1 pl-6 text-sm">{m.consignes.map((c) => <li key={c}>{c}</li>)}</ul>
        <p className="rounded-lg bg-bordeaux/10 p-3 text-sm"><strong>Erreur fréquente :</strong> {m.erreur}</p>
      </article>
    </section>
  );
}
