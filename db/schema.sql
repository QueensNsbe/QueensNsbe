-- Newsletter subscribers for the NSBE Queen's site.
-- The app also runs this automatically on its first request (src/lib/db.ts),
-- so you only need to run it by hand if you want to inspect or reset the table.

CREATE TABLE IF NOT EXISTS subscribers (
  id                 BIGSERIAL PRIMARY KEY,
  email              TEXT        NOT NULL,
  first_name         TEXT        NOT NULL,
  source             TEXT        NOT NULL DEFAULT 'page',   -- 'page' (Join page) or 'banner' (popup)
  ip_hash            TEXT,                                   -- hashed, never the raw IP; used for rate limiting
  unsubscribe_token  UUID        NOT NULL DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at    TIMESTAMPTZ
);

-- One row per email, ignoring case (Sam@QueensU.ca == sam@queensu.ca).
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_key ON subscribers (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_token_key ON subscribers (unsubscribe_token);
CREATE INDEX IF NOT EXISTS subscribers_ip_recent ON subscribers (ip_hash, created_at);
