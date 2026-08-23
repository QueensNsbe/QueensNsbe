// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://queensnsbe.ca',
  server: {
    // Bind every interface so http://localhost:4321 works in Safari too.
    // Without this the dev server binds IPv6 [::1] only, which Safari
    // cannot reach because it resolves localhost to IPv4 127.0.0.1.
    host: true,
    port: 4321,
  },
});
