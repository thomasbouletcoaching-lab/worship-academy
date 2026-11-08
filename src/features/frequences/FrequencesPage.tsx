// Visualiseur pédagogique : où se place chaque instrument sur le spectre audible (ordre de grandeur).
const BANDS = [
  { label: 'Basse et grosse caisse', from: 40, to: 250, color: '#7c9a7e', note: 'Le bassiste et le kick occupent le grave : la main gauche ne double pas la basse.' },
  { label: 'Zone de boue', from: 250, to: 500, color: '#7a2e3a', note: 'Trop de piano et de pads ici rend le mix confus. Aère les voicings.' },
  { label: 'Piano, guitares, pads (médium)', from: 500, to: 2000, color: '#c9a24a', note: 'Le cœur harmonique : les voicings vivent ici, sous la voix.' },
  { label: 'Présence vocale', from: 2000, to: 5000, color: '#3b6ea5', note: 'Zone où la voix se détache. Ne joue pas la mélodie au-dessus du chanteur.' },
  { label: 'Brillance', from: 5000, to: 16000, color: '#8e7cc3', note: "Cymbales, souffle des cordes. Garde-la légère dans un set." },
];

const LOG_MIN = Math.log10(30);
const LOG_MAX = Math.log10(16000);
const pos = (f: number) => ((Math.log10(f) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;

export default function FrequencesPage() {
  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Où se place la musique ?</h1>
      <p className="max-w-2xl text-sm opacity-80">
        Chaque instrument occupe une partie du spectre. Quand deux instruments jouent dans la même zone, on les entend moins bien.
        Ordres de grandeur, échelle logarithmique.
      </p>
      <div className="relative h-16 w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
        {BANDS.map((b) => (
          <div key={b.label} className="absolute top-0 h-full opacity-80"
            style={{ left: `${pos(b.from)}%`, width: `${pos(b.to) - pos(b.from)}%`, background: b.color }} title={b.label} />
        ))}
      </div>
      <div className="flex justify-between text-xs opacity-60"><span>30 Hz</span><span>250</span><span>500</span><span>2 kHz</span><span>5 kHz</span><span>16 kHz</span></div>
      <ul className="space-y-3">
        {BANDS.map((b) => (
          <li key={b.label} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
            <p className="font-medium"><span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: b.color }} />{b.label} · {b.from}–{b.to} Hz</p>
            <p className="mt-1 text-sm opacity-80">{b.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
