// Event categories, in legend order. Keys are stored in each event's
// frontmatter; tina/config.ts and the colours in global.css use the same keys.
export const EVENT_CATEGORIES = {
  community: 'Community & Social',
  academic: 'Academic Support',
  professional: 'Professional Development',
  mentorship: 'Mentorship',
  partnerships: 'Partnerships',
  wellness: 'Wellness',
  signature: 'Signature Events',
} as const;

export type EventCategory = keyof typeof EVENT_CATEGORIES;
export const CATEGORY_KEYS = Object.keys(EVENT_CATEGORIES) as [EventCategory, ...EventCategory[]];
