import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each collection below mirrors a Decap CMS collection in public/admin/config.yml.
// The schema validates frontmatter at build time — if an exec fills in a CMS form
// wrong (e.g. leaves out a title), `npm run build` fails with a clear error instead
// of shipping a broken page.

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    time: z.string().optional(),
    location: z.string().optional(),
    image: z.string().optional(),
    rsvpLink: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

const exec = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/exec' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    department: z.string().optional(),
    photo: z.string().optional(),
    email: z.string().email().optional(),
    linkedin: z.string().url().optional(),
    order: z.number().default(0),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().optional(),
    image: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

// Singleton editable pages (About, Contact, Mentorship) — one file each,
// edited as a "file collection" in Decap rather than a folder of many entries.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = { events, exec, blog, pages };
