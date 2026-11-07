// Server-only database access. Nothing in this file is ever sent to the browser:
// it is imported only by the action in src/actions and the server routes in src/pages.
import pg from 'pg';
import { createHash } from 'node:crypto';
// ?raw makes Vite inline the file's text at build time, so it works inside the bundled serverless function.
import SCHEMA from '../../db/schema.sql?raw';

const connectionString = process.env.DATABASE_URL ?? import.meta.env.DATABASE_URL;

// One small pool per server instance. On Vercel each function instance is reused
// across requests, so this avoids opening a new connection on every signup.
let pool: pg.Pool | undefined;
function getPool(): pg.Pool {
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  // Neon's URL carries sslmode=require, which newer pg versions warn about.
  // Drop it and ask for full certificate verification explicitly instead.
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  pool ??= new pg.Pool({
    connectionString: url.toString(),
    max: 3,
    ssl: isLocal ? false : true,
  });
  return pool;
}

// Create the table the first time this instance talks to the database.
let ready: Promise<unknown> | undefined;
export async function db(): Promise<pg.Pool> {
  const p = getPool();
  ready ??= p.query(SCHEMA).catch((err) => { ready = undefined; throw err; });
  await ready;
  return p;
}

// Hash IPs so we can rate-limit without storing anyone's real address.
export function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? 'nsbe-queens';
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

export type SubscribeResult = 'subscribed' | 'already-subscribed' | 'resubscribed' | 'rate-limited';

const MAX_SIGNUPS_PER_IP_PER_HOUR = 5;

export async function addSubscriber(input: {
  email: string;
  firstName: string;
  source: 'page' | 'banner';
  ipHash: string | null;
}): Promise<SubscribeResult> {
  const pool = await db();

  if (input.ipHash) {
    const { rows } = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM subscribers
        WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'`,
      [input.ipHash],
    );
    if (rows[0].n >= MAX_SIGNUPS_PER_IP_PER_HOUR) return 'rate-limited';
  }

  // Insert, or if the email already exists, update the name and clear any
  // earlier unsubscribe. xmax = 0 is Postgres's way of saying "this row was
  // freshly inserted", which tells us new vs. returning subscribers in one query.
  const { rows } = await pool.query<{ inserted: boolean; was_unsubscribed: boolean }>(
    `WITH prev AS (
       SELECT unsubscribed_at IS NOT NULL AS was_unsubscribed
         FROM subscribers WHERE lower(email) = lower($1)
     )
     INSERT INTO subscribers (email, first_name, source, ip_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (lower(email)) DO UPDATE
       SET first_name = EXCLUDED.first_name, unsubscribed_at = NULL
     RETURNING (xmax = 0) AS inserted,
               coalesce((SELECT was_unsubscribed FROM prev), false) AS was_unsubscribed`,
    [input.email, input.firstName, input.source, input.ipHash],
  );

  const row = rows[0];
  if (row.inserted) return 'subscribed';
  return row.was_unsubscribed ? 'resubscribed' : 'already-subscribed';
}

/** Returns the email that was unsubscribed, or null if the token matched nobody. */
export async function unsubscribe(token: string): Promise<string | null> {
  const pool = await db();
  const { rows } = await pool.query<{ email: string }>(
    `UPDATE subscribers SET unsubscribed_at = coalesce(unsubscribed_at, now())
      WHERE unsubscribe_token = $1 RETURNING email`,
    [token],
  );
  return rows[0]?.email ?? null;
}

export async function listSubscribers() {
  const pool = await db();
  const { rows } = await pool.query<{
    email: string; first_name: string; source: string; created_at: Date; unsubscribe_token: string;
  }>(
    `SELECT email, first_name, source, created_at, unsubscribe_token
       FROM subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at`,
  );
  return rows;
}
