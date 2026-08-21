import { defineConfig } from 'tinacms';

// Tina reads and writes the same Markdown files in src/content that Astro's
// content collections already use, so the site keeps building exactly as before.
// Field names here must match the frontmatter keys in src/content.config.ts.

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'main',
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images/uploads',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'events',
        label: 'Events',
        path: 'src/content/events',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'datetime', name: 'date', label: 'Date', required: true, ui: { dateFormat: 'YYYY-MM-DD' } },
          { type: 'string', name: 'time', label: 'Time', description: 'e.g. 6:00 PM' },
          { type: 'string', name: 'location', label: 'Location' },
          { type: 'image', name: 'image', label: 'Image' },
          { type: 'string', name: 'rsvpLink', label: 'RSVP Link', description: 'Full URL — Eventbrite, Google Form, etc.' },
          { type: 'rich-text', name: 'body', label: 'Description', isBody: true },
        ],
      },
      {
        name: 'exec',
        label: 'Exec Team',
        path: 'src/content/exec',
        format: 'md',
        fields: [
          { type: 'string', name: 'name', label: 'Name', isTitle: true, required: true },
          { type: 'string', name: 'role', label: 'Role', required: true, description: 'e.g. President, VP Events' },
          { type: 'string', name: 'department', label: 'Department' },
          { type: 'image', name: 'photo', label: 'Photo' },
          { type: 'string', name: 'email', label: 'Email' },
          { type: 'string', name: 'linkedin', label: 'LinkedIn URL' },
          { type: 'number', name: 'order', label: 'Sort Order', description: 'Lower numbers show first' },
          { type: 'rich-text', name: 'body', label: 'Bio', isBody: true },
        ],
      },
      {
        name: 'testimonials',
        label: 'Testimonials',
        path: 'src/content/testimonials',
        format: 'md',
        fields: [
          { type: 'string', name: 'name', label: 'Name', isTitle: true, required: true },
          { type: 'string', name: 'role', label: 'Role', description: "e.g. Queen's NSBE Alumni" },
          { type: 'image', name: 'photo', label: 'Photo' },
          { type: 'string', name: 'quote', label: 'Quote', required: true, ui: { component: 'textarea' } },
          { type: 'number', name: 'order', label: 'Sort Order' },
          { type: 'rich-text', name: 'body', isBody: true, label: 'Unused' },
        ],
      },
      {
        name: 'blog',
        label: 'Blog / Announcements',
        path: 'src/content/blog',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'datetime', name: 'date', label: 'Date', required: true, ui: { dateFormat: 'YYYY-MM-DD' } },
          { type: 'string', name: 'author', label: 'Author' },
          { type: 'image', name: 'image', label: 'Cover Image' },
          { type: 'string', name: 'excerpt', label: 'Excerpt', ui: { component: 'textarea' } },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'pages',
        label: 'Pages',
        path: 'src/content/pages',
        format: 'md',
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'seoDescription', label: 'SEO Description' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
    ],
  },
});
