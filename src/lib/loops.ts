// Mirrors our subscriber list into Loops, which is what actually sends the
// emails. Our Postgres table stays the source of truth: if Loops is down or
// the key is missing, the signup is still saved and we just log the problem.
const API = 'https://app.loops.so/api/v1';
const TIMEOUT_MS = 4000;

function apiKey(): string | undefined {
  return process.env.LOOPS_API_KEY ?? import.meta.env.LOOPS_API_KEY;
}

async function call(method: 'POST' | 'PUT', path: string, body: object): Promise<Response> {
  return fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

/** Add or re-subscribe a contact in Loops. Never throws; returns what happened for the logs. */
export async function syncContactToLoops(c: { email: string; firstName: string; source: string }): Promise<'ok' | 'skipped-no-key' | 'failed'> {
  if (!apiKey()) {
    console.warn('Loops sync skipped: LOOPS_API_KEY is not set for this deployment');
    return 'skipped-no-key';
  }
  try {
    const contact = { email: c.email, firstName: c.firstName, source: `website-${c.source}`, subscribed: true };
    let res = await call('POST', '/contacts/create', contact);
    // 409 = this email is already in Loops; update it instead (this also re-subscribes them).
    if (res.status === 409) res = await call('PUT', '/contacts/update', contact);
    if (!res.ok) {
      console.error('Loops sync failed', res.status, await res.text());
      return 'failed';
    }
    return 'ok';
  } catch (err) {
    console.error('Loops sync failed', err);
    return 'failed';
  }
}

/** Mark a contact unsubscribed in Loops. Never throws. */
export async function unsubscribeInLoops(email: string): Promise<void> {
  if (!apiKey()) return;
  try {
    const res = await call('PUT', '/contacts/update', { email, subscribed: false });
    if (!res.ok && res.status !== 404) console.error('Loops unsubscribe failed', res.status, await res.text());
  } catch (err) {
    console.error('Loops unsubscribe failed', err);
  }
}
