async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function loginWithSpotify() {
  const clientId = '2c5922b245944d7087cacfc63872f736';
  const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/callback/';
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('code_verifier', verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}
