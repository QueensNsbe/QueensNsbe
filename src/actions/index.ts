// Astro Actions: type-safe server functions the browser can call.
// The React form calls `actions.subscribe(formData)`; Astro turns that into a
// POST to /_actions/subscribe, validates the input with the Zod schema below,
// and runs `handler` on the server (a Vercel serverless function in production).
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { addSubscriber, hashIp } from '../lib/db';
import { syncContactToLoops } from '../lib/loops';

export const server = {
  subscribe: defineAction({
    accept: 'form',
    input: z.object({
      firstName: z.string({ error: 'Please enter your name.' }).trim().min(1, 'Please enter your name.').max(80),
      email: z.string({ error: 'Please enter your email.' }).trim().toLowerCase().pipe(z.email('Please enter a valid email.')).pipe(z.string().max(254)),
      source: z.enum(['page', 'banner']).default('page'),
      // Honeypot: hidden from people, but bots fill in every field.
      nsbe_hp_x7: z.string().optional(),
    }),
    handler: async (input, context) => {
      if (input.nsbe_hp_x7) {
        // Pretend it worked so the bot doesn't learn anything.
        console.warn('subscribe: honeypot filled, ignored', { source: input.source });
        return { status: 'subscribed' as const };
      }

      let status;
      try {
        status = await addSubscriber({
          email: input.email,
          firstName: input.firstName,
          source: input.source,
          ipHash: hashIp(context.clientAddress),
        });
      } catch (err) {
        console.error('subscribe failed', err);
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong. Please try again.' });
      }

      if (status === 'rate-limited') {
        throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'Too many signups right now. Please try again later.' });
      }
      // Saved in our database; now copy the contact to Loops so campaigns reach them.
      // Awaited (not fire-and-forget) because serverless functions can freeze once
      // the response is sent. It has its own timeout and never fails the signup.
      const loops = await syncContactToLoops({ email: input.email, firstName: input.firstName, source: input.source });
      console.log('subscribe: saved', { status, source: input.source, loops });
      return { status };
    },
  }),
};
