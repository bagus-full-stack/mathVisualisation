import { createClient } from "@libsql/client"

// Falls back to a local SQLite file when no Turso credentials are set,
// so sharing works out of the box in dev. Set TURSO_DATABASE_URL /
// TURSO_AUTH_TOKEN in production to point at a real Turso database.
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
})

let schemaReady: Promise<unknown> | null = null

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = db.execute(`
      CREATE TABLE IF NOT EXISTS shared_graphs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        function_expression TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `)
  }
  return schemaReady
}
