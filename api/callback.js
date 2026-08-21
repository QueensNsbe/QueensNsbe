// Step 2: GitHub redirects back here with a code. Swap it for an access token
// and hand that to the Decap window that opened this popup.
// Decap's popup handshake is three steps: the popup announces itself with
// "authorizing:github", the CMS window echoes that back, and only then does the
// popup send the token. Sending the token first lands on a listener that isn't
// attached yet, so the popup closes and nothing happens.
function page(status, payload) {
  const body = JSON.stringify(JSON.stringify(payload));
  return `<!doctype html><html><body><p>Completing sign-in&hellip;</p><script>
  (function () {
    var payload = ${body};
    function receive(e) {
      if (e.data !== 'authorizing:github') return;
      window.removeEventListener('message', receive, false);
      window.opener.postMessage('authorization:github:${status}:' + payload, e.origin);
      setTimeout(function () { window.close(); }, 500);
    }
    window.addEventListener('message', receive, false);
    if (window.opener) {
      window.opener.postMessage('authorizing:github', window.location.origin);
    } else {
      document.body.innerHTML = '<p>Open this from the CMS login button.</p>';
    }
  })();
  </script></body></html>`;
}

function readCookie(header, name) {
  return (header || '')
    .split(';')
    .map((c) => c.trim().split('='))
    .filter(([k]) => k === name)
    .map(([, v]) => v)[0];
}

export default async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const { code, state } = req.query;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Set-Cookie', 'decap_oauth_state=; Path=/; Max-Age=0');

  if (!clientId || !clientSecret) {
    res.status(500).send(page('error', { message: 'OAuth env vars are not set.' }));
    return;
  }
  if (!code || !state || state !== readCookie(req.headers.cookie, 'decap_oauth_state')) {
    res.status(400).send(page('error', { message: 'Invalid or expired login attempt.' }));
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json();
    if (data.error || !data.access_token) {
      res.status(401).send(page('error', { message: data.error_description || 'Token exchange failed.' }));
      return;
    }
    res.status(200).send(page('success', { token: data.access_token, provider: 'github' }));
  } catch (err) {
    res.status(500).send(page('error', { message: 'Could not reach GitHub.' }));
  }
}
