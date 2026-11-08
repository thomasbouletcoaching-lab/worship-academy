// Point d'extension Supabase (non activé). Pour l'activer :
// 1. créer une table `kv` (user_id uuid, key text, value jsonb, primary key (user_id, key)) avec RLS par utilisateur ;
// 2. installer @supabase/supabase-js (MIT) et renseigner VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ;
// 3. implémenter un cache local synchrone (l'interface Repository est synchrone) qui se synchronise en tâche de fond,
//    puis appeler setRepository(createSupabaseRepository(client, userId)) au démarrage.
import type { Repository } from './repository';
import { localRepository } from './repository';

export interface KvClient {
  upsert(key: string, value: unknown): Promise<void>;
}

/** Écrit localement tout de suite, puis pousse vers le serveur (sans bloquer l'interface). */
export function createSupabaseRepository(client: KvClient): Repository {
  return {
    get: localRepository.get,
    set(key, value) {
      localRepository.set(key, value);
      void client.upsert(key, value).catch(() => { /* resynchronisation au prochain démarrage */ });
    },
  };
}
