// Single source of truth for the chapter's social links, used by the nav,
// footer, and the homepage "See the chapter in motion" strip.
//
// To turn on the Discord link: paste the invite URL into `discord` below.
// While it is an empty string the Discord button and icon stay hidden, so a
// half-finished invite never ships to the live site.
//
// Get the URL from Discord: server name -> Invite People -> Edit invite link ->
// set "Expire after" to Never and "Max number of uses" to No limit -> copy.
export const SOCIALS = {
  instagram: 'https://www.instagram.com/nsbe.queens/',
  linkedin: 'https://www.linkedin.com/company/nsbe-queen-s-university/posts/?feedView=all',
  tiktok: 'https://www.tiktok.com/@queens.nsbe',
  discord: '',
};

export const ICON_PATHS = {
  linkedin:
    'M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.84v2.05h.05c.53-1 1.83-2.05 3.77-2.05C19.9 8 21 10.13 21 13.53V23h-4v-8.5c0-2.03-.04-4.65-2.83-4.65-2.84 0-3.28 2.22-3.28 4.5V23h-4V8z',
  tiktok:
    'M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z',
  discord:
    'M20.32 4.37A19.8 19.8 0 0 0 15.43 3c-.24.42-.5.98-.68 1.43a18.3 18.3 0 0 0-5.5 0C9.07 3.98 8.8 3.42 8.57 3a19.7 19.7 0 0 0-4.9 1.37C.58 9 .13 13.44.35 17.83A19.9 19.9 0 0 0 6.4 20.9c.49-.67.92-1.38 1.29-2.13-.71-.27-1.39-.6-2.03-.98.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.1 0c.16.14.33.27.5.4-.65.38-1.33.71-2.04.98.37.75.8 1.46 1.29 2.13a19.8 19.8 0 0 0 6.06-3.07c.26-5.09-.44-9.49-3.75-13.46ZM8.02 15.16c-1.18 0-2.16-1.08-2.16-2.42s.95-2.43 2.16-2.43 2.18 1.1 2.16 2.43c0 1.34-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42s.95-2.43 2.16-2.43 2.18 1.1 2.16 2.43c0 1.34-.94 2.42-2.16 2.42Z',
  instagram: null, // drawn with shapes, not a path
};
