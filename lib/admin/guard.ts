import { isDatabaseConfigured } from "@/lib/db/repository";

/** Bezpieczne sprawdzenie konfiguracji — panel nigdy nie crashuje bez bazy. */
export function dbReady(): boolean {
  return isDatabaseConfigured();
}

export const DB_OFFLINE_NOTICE =
  "Baza danych nie jest podłączona. Ustaw DATABASE_URL i uruchom SQL z supabase/schema.sql, aby zobaczyć i edytować dane.";
