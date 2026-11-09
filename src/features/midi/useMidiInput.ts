// Entrée Web MIDI (clavier maître). Dégrade proprement si le navigateur ne la propose pas.
import { useEffect, useRef, useState } from 'react';

export interface MidiEvent {
  note: number;
  velocity: number; // 0..127
  on: boolean;
  at: number; // performance.now() en ms
}


export function useMidiInput(onEvent?: (e: MidiEvent) => void) {
  const [status, setStatus] = useState<'indisponible' | 'en attente' | 'connecté' | 'aucun clavier'>('en attente');
  const [active, setActive] = useState<number[]>([]);
  const [device, setDevice] = useState<string>('');
  const cb = useRef(onEvent);
  cb.current = onEvent;

  useEffect(() => {
    const nav = navigator as Navigator & { requestMIDIAccess?: () => Promise<MIDIAccess> };
    if (!nav.requestMIDIAccess) {
      setStatus('indisponible');
      return;
    }
    let access: MIDIAccess | null = null;
    const handler = (msg: MIDIMessageEvent) => {
      if (!msg.data) return;
      const [st, note, vel = 0] = Array.from(msg.data);
      const cmd = st & 0xf0;
      const on = cmd === 0x90 && vel > 0;
      const off = cmd === 0x80 || (cmd === 0x90 && vel === 0);
      if (!on && !off) return;
      setActive((prev) => (on ? (prev.includes(note) ? prev : [...prev, note]) : prev.filter((n) => n !== note)));
      cb.current?.({ note, velocity: vel, on, at: performance.now() });
    };
    const bind = () => {
      if (!access) return;
      const inputs = [...access.inputs.values()];
      inputs.forEach((i) => { i.onmidimessage = handler; });
      setDevice(inputs.map((i) => i.name ?? 'clavier').join(', '));
      setStatus(inputs.length ? 'connecté' : 'aucun clavier');
    };
    nav.requestMIDIAccess().then((a) => {
      access = a;
      bind();
      a.onstatechange = bind;
    }).catch(() => setStatus('indisponible'));
    return () => {
      if (access) for (const input of access.inputs.values()) input.onmidimessage = null;
    };
  }, []);

  return { status, active, device };
}
