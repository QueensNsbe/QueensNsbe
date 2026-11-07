// Download the email list as a CSV the exec team can open in Excel or import
// into any email tool. Protected by a password (HTTP Basic auth): the browser
// shows a login box; any username works, the password is ADMIN_PASSWORD.
import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { listSubscribers } from '../../lib/db';

export const prerender = false;

function authorized(header: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? import.meta.env.ADMIN_PASSWORD;
  if (!expected || !header?.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString();
  const given = Buffer.from(decoded.slice(decoded.indexOf(':') + 1));
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export const GET: APIRoute = async ({ request, url }) => {
  if (!authorized(request.headers.get('authorization'))) {
    return new Response('Password required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="NSBE Queen\'s admin"' },
    });
  }

  const rows = await listSubscribers();
  const lines = [
    'email,first_name,source,subscribed_at,unsubscribe_link',
    ...rows.map((r) =>
      [r.email, r.first_name, r.source, r.created_at.toISOString(),
       new URL(`/unsubscribe?token=${r.unsubscribe_token}`, url.origin).href].map(cell).join(','),
    ),
  ];
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="nsbe-subscribers.csv"',
      'Cache-Control': 'no-store',
    },
  });
};
