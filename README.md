# NSBE Queen's Chapter Website

The official website for the National Society of Black Engineers (NSBE), Queen's University Chapter.

**Live:** https://queens-nsbe.vercel.app

![NSBE Queen's home page](docs/screenshot.jpg)

## What it does

- **Home.** Introduces the chapter, with a newsletter signup and a Discord invite.
- **About.** The mission, the co-presidents and the 2026–27 executive team.
- **Mentorship.** The chapter's mentorship program and how to take part.
- **Events.** Upcoming and past events, sorted into categories.
- **Join / Contact.** How to become a member and how to reach the exec team.
- **Content editing.** Exec members can update the team, events and page text through TinaCMS, with no code changes.

## Tech stack

| Layer | Tech |
| --- | --- |
| Framework | Astro (static site) |
| Content | TinaCMS (content files in `src/content`) |
| Styling | Custom CSS |
| Hosting | Vercel, with Vercel Analytics |

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

This starts Astro together with the TinaCMS editor. Open the URL it prints (usually http://localhost:4321). To edit content in the CMS, go to `/admin`.

To build for production:

```bash
npm run build
npm run preview
```
