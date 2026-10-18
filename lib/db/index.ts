/**
 * Połączenie z bazą (Supabase / PostgreSQL przez DATABASE_URL).
 *
 * BRAK DATABASE_URL nie rozbija builda — funkcje zwracają czytelny błąd,
 * a warstwa wyższa (checkout, panel admina) pokazuje instrukcję podłączenia.
 */

import { Pool } from "pg";

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Baza danych nie jest podłączona. Ustaw DATABASE_URL w .env.local " +
        "(a na Vercelu w Environment Variables) i uruchom SQL z supabase/schema.sql.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let pool: Pool | null = null;

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new DatabaseNotConfiguredError();

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: connectionString.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

/** Wykonaj zapytanie w transakcji; przy błędzie rollback. */
export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
