// Step 1 of the Decap CMS GitHub login: send the editor to GitHub to approve.
// Requires GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars in Vercel.
import crypto from 'node:crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID is not set on this deployment.');
    return;
  }

  // CSRF token, echoed back by GitHub and checked in /api/callback.
  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader(
    'Set-Cookie',
    `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', 'repo user');
  url.searchParams.set('state', state);

  res.redirect(302, url.toString());
}
