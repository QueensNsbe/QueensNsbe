// Latest internship postings from the chapter Discord, for the home page.
// Vercel's CDN caches the response for an hour, so Discord is asked at most
// about once an hour no matter how many people visit.
import type { APIRoute } from 'astro';
import { fetchInternships, internshipsConfigured, SAMPLE_INTERNSHIPS } from '../../lib/internships';

export const prerender = false;

const json = (body: unknown, cache: string) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  });

export const GET: APIRoute = async () => {
  if (!internshipsConfigured()) {
    // Lets the section be previewed locally before the bot exists.
    return json({ postings: import.meta.env.DEV ? SAMPLE_INTERNSHIPS : [], sample: import.meta.env.DEV }, 'no-store');
  }
  try {
    const postings = await fetchInternships();
    return json({ postings }, 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  } catch (err) {
    console.error('internships:', err);
    // Short cache so a Discord hiccup clears up quickly.
    return json({ postings: [] }, 'public, max-age=0, s-maxage=300');
  }
};
