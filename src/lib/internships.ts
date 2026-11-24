// Reads internship postings from the chapter's Discord channel.
//
// A read-only Discord bot (DISCORD_BOT_TOKEN) fetches the latest messages in
// DISCORD_INTERNSHIPS_CHANNEL_ID. See docs/internships-discord.md for setup.
//
// Two post styles are understood:
//
// 1. Roundup posts (how the presidents usually post): ALL-CAPS headings group
//    numbered internships, and each one has its own details and link.
//
//      CIVIL & STRUCTURAL ENGINEERING
//      2. Hatch – Structural Engineering Student
//      Location: Trail, BC
//      Start: January 2027
//      Pay: $26–$34/hour
//      Relevant programs: Civil Engineering
//      Official application:
//      https://jobs.hatch.com/job/...
//
//    Every numbered item with a link becomes its own card.
//
// 2. Single posts: any other message with a link becomes one card, titled by
//    its first line.
//
// Messages without a link (chat, questions) are skipped.

export interface Internship {
  id: string;
  title: string;
  /** Short extra text, e.g. the relevant programs. */
  details: string;
  link: string;
  /** Host of the link, e.g. "jobs.hatch.com", shown as a hint. */
  site: string;
  postedAt: string;
  category?: string;
  location?: string;
  pay?: string;
  term?: string;
  deadline?: string;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
}
interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  embeds?: DiscordEmbed[];
}

const MAX_AGE_DAYS = 45;
const MAX_POSTINGS = 6;
const URL_RE = /https?:\/\/[^\s<>]+/i;

/** First link in some text. Keeps parentheses that belong to the URL, e.g. "(Summer-2027)". */
function findUrl(text: string): string | undefined {
  let url = text.match(URL_RE)?.[0];
  if (!url) return undefined;
  url = url.replace(/[.,!?'"*_>]+$/, '');
  // Drop a closing ")" left over from markdown like [text](url) or "(see https://…)".
  while (url.endsWith(')') && (url.match(/\(/g)?.length ?? 0) < (url.match(/\)/g)?.length ?? 0)) {
    url = url.slice(0, -1);
  }
  return url;
}
const ITEM_RE = /^\s*(\d{1,2})[.)]\s+(.+)$/;

/** Turns Discord markdown into plain text a card can show. */
function plain(text: string): string {
  return text
    .replace(/<a?:\w+:\d+>/g, '') // custom emoji
    .replace(/<[@#][!&]?\d+>/g, '') // user, role and channel mentions
    .replace(/@(everyone|here)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url)
    .replace(/<?https?:\/\/\S+>?/g, '') // bare links (shown as the button instead)
    .replace(/\|\|/g, '') // spoilers (a single "|" is kept, as in "Summer 2027 | 16 months")
    .replace(/[*_~`>#]+/g, '') // bold, italics, quotes, headings
    .replace(/[ \t]+/g, ' ')
    .trim();
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

function safeUrl(found: string | undefined): string | undefined {
  if (!found) return undefined;
  try {
    const u = new URL(found);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** A heading like "CIVIL & STRUCTURAL ENGINEERING": mostly capital letters, no link. */
function isHeading(line: string): boolean {
  const text = plain(line);
  const letters = text.replace(/[^A-Za-z]/g, '');
  return letters.length >= 4 && letters === letters.toUpperCase() && !/https?:\/\//i.test(line) && !ITEM_RE.test(text);
}

/** Reads "Label: value" lines from a block. */
function field(lines: string[], labels: RegExp): string | undefined {
  for (const raw of lines) {
    const line = plain(raw);
    const m = line.match(new RegExp(`^(?:${labels.source})\\s*[:\\-–]\\s*(.+)$`, 'i'));
    if (m && m[1].trim()) return clip(m[1].trim().replace(/[.!]+$/, ''), 60);
  }
  return undefined;
}

function blockToInternship(
  msg: DiscordMessage,
  key: string,
  title: string,
  body: string[],
  category?: string
): Internship | undefined {
  const link = safeUrl(findUrl(body.join('\n')));
  if (!link || !title) return undefined;
  const programs = field(body, /relevant programs?|programs?|open to|eligibility/);
  return {
    id: `${msg.id}-${key}`,
    title: clip(title, 110),
    details: programs ? `For ${programs.replace(/^for\s+/i, '')}` : '',
    link,
    site: new URL(link).hostname.replace(/^www\./, ''),
    postedAt: msg.timestamp,
    category: category ? clip(category, 50) : undefined,
    location: field(body, /location|where/),
    pay: field(body, /pay|salary|compensation|wage/),
    term: field(body, /term|start|start date|duration|length/),
    deadline: field(body, /deadline|due|closes?|apply by/),
  };
}

/** Roundup posts: one card per numbered item. */
function fromRoundup(msg: DiscordMessage): Internship[] {
  const lines = msg.content.split('\n');
  const out: Internship[] = [];
  let category: string | undefined;
  let current: { n: string; title: string; body: string[]; category?: string } | undefined;

  const flush = () => {
    if (!current) return;
    const p = blockToInternship(msg, current.n, current.title, current.body, current.category);
    if (p) out.push(p);
    current = undefined;
  };

  for (const raw of lines) {
    const item = plain(raw).match(ITEM_RE);
    if (item) {
      flush();
      current = { n: item[1], title: item[2].trim(), body: [], category };
    } else if (isHeading(raw)) {
      flush();
      category = toTitleCase(plain(raw));
    } else if (current) {
      current.body.push(raw);
    }
  }
  flush();
  return out;
}

/** "CIVIL & STRUCTURAL ENGINEERING" → "Civil & Structural Engineering". */
function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

/** Any other post with a link: one card titled by its first line. */
function fromSingle(msg: DiscordMessage): Internship | undefined {
  const lines = msg.content.split('\n');
  const firstText = lines.map(plain).find(Boolean);
  const embedTitle = plain(msg.embeds?.find((e) => e.title)?.title ?? '');
  const title = firstText ?? embedTitle;
  const withEmbedLink = findUrl(msg.content) ? lines : [...lines, msg.embeds?.find((e) => e.url)?.url ?? ''];
  const p = blockToInternship(msg, '0', title, withEmbedLink);
  if (!p) return undefined;
  if (!p.details) {
    const rest = lines
      .map(plain)
      .filter(Boolean)
      .slice(1)
      .filter((l) => !/^(?:location|pay|salary|term|start|deadline|due|closes?|apply by|official application)\b/i.test(l))
      .join(' ');
    p.details = clip(rest || plain(msg.embeds?.[0]?.description ?? ''), 160);
  }
  return p;
}

export function toInternships(msg: DiscordMessage): Internship[] {
  const roundup = fromRoundup(msg);
  if (roundup.length) return roundup;
  const single = fromSingle(msg);
  return single ? [single] : [];
}

const env = (key: string) => process.env[key] ?? (import.meta.env as Record<string, string | undefined>)[key];

export function internshipsConfigured(): boolean {
  return Boolean(env('DISCORD_BOT_TOKEN') && env('DISCORD_INTERNSHIPS_CHANNEL_ID'));
}

export async function fetchInternships(): Promise<Internship[]> {
  const token = env('DISCORD_BOT_TOKEN');
  const channel = env('DISCORD_INTERNSHIPS_CHANNEL_ID');
  if (!token || !channel) return [];

  const res = await fetch(`https://discord.com/api/v10/channels/${channel}/messages?limit=50`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) throw new Error(`Discord responded ${res.status}`);

  const cutoff = Date.now() - MAX_AGE_DAYS * 86_400_000;
  const messages = (await res.json()) as DiscordMessage[]; // newest first
  return messages
    .filter((m) => Date.parse(m.timestamp) >= cutoff)
    .flatMap(toInternships)
    .slice(0, MAX_POSTINGS);
}

/** Shown only on the local dev server when no bot is set up yet. */
export const SAMPLE_INTERNSHIPS: Internship[] = toInternships({
  id: 'sample',
  timestamp: new Date(Date.now() - 26 * 3_600_000).toISOString(),
  content: [
    'INDUSTRIAL, MANUFACTURING & AEROSPACE ENGINEERING',
    '',
    '1. Bombardier – Plant Engineering Maintenance Intern',
    'Location: Mississauga, ON',
    'Term: Summer 2027 intake | 16 months',
    'Pay: $17.95–$31.00/hour',
    'Relevant programs: Industrial Engineering.',
    'Official application:',
    'https://jobs.bombardier.com/',
    '',
    'CIVIL & STRUCTURAL ENGINEERING',
    '',
    '2. Hatch – Structural Engineering Student',
    'Location: Trail, BC',
    'Start: January 2027',
    'Pay: $26–$34/hour',
    'Relevant programs: Civil Engineering, particularly structural engineering.',
    'Official application:',
    'https://jobs.hatch.com/',
    '',
    'SOFTWARE ENGINEERING',
    '',
    '3. Shopify – Software Engineering Intern',
    'Location: Remote (Canada)',
    'Term: Summer 2027 | 4 months',
    'Deadline: Dec 5',
    'Relevant programs: Computer, Software, or Electrical Engineering.',
    'https://www.shopify.com/careers',
  ].join('\n'),
});
