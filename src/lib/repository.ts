// Couche d'accès aux données. Implémentation locale (localStorage) aujourd'hui ;
// une implémentation Supabase pourra respecter la même interface (voir supabaseRepository.ts).
export interface Repository {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
}

export const localRepository: Repository = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* stockage indisponible : l'app continue sans mémoriser */
    }
  },
};

/** Dépôt en mémoire (tests, navigation privée). */
export function memoryRepository(): Repository {
  const m = new Map<string, string>();
  return {
    get<T>(key: string, fallback: T): T {
      const raw = m.get(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    },
    set(key: string, value: unknown) {
      m.set(key, JSON.stringify(value));
    },
  };
}

let current: Repository = localRepository;
export const repo = () => current;
export const setRepository = (r: Repository) => { current = r; };
