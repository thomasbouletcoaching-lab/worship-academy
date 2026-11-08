// Entrée Web MIDI (clavier maître). Dégrade proprement si le navigateur ne l'a pas.
import { useEffect, useState } from 'react';

export interface MidiEvent {
  note: number;
  velocity: number;
  on: boolean;
  at: number; // horodatage (ms, performance.now)
}

export function useMidiInput(onEvent?: (e: MidiEvent) => void) {
  const [status, setStatus] = useState<'indisponible' | 'en attente' | 'connecté'>('en attente');
  const [active, setActive] = useState<number[]>([]);

  useEffect(() => {
    const nav = navigator as Navigator & { requestMIDIAccess?: () => Promise<any> };
    if (!nav.requestMIDIAccess) {
      setStatus('indisponible');
      return;
    }
    let access: any = null;
    const handler = (msg: any) => {
      const [status, note, vel = 0] = msg.data as number[];
      const cmd = status & 0xf0;
      const on = cmd === 0x90 && vel > 0;
      const off = cmd === 0x80 || (cmd === 0x90 && vel === 0);
      if (!on && !off) return;
      setActive((prev) => (on ? [...new Set([...prev, note])] : prev.filter((n) => n !== note)));
      onEvent?.({ note, velocity: vel, on, at: performance.now() });
    };
    nav.requestMIDIAccess().then((a: any) => {
      access = a;
      setStatus('connecté');
      for (const input of a.inputs.values()) input.onmidimessage = handler;
      a.onstatechange = () => {
        for (const input of a.inputs.values()) input.onmidimessage = handler;
      };
    }).catch(() => setStatus('indisponible'));
    return () => {
      if (access) for (const input of access.inputs.values()) input.onmidimessage = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, active };
}
