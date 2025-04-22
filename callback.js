window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const verifier = localStorage.getItem('code_verifier');
  const clientId = '2c5922b245944d7087cacfc63872f736';
  const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/callback/';

  if (!code || !verifier) {
    alert('Kon niet inloggen. Probeer opnieuw.');
    window.location.href = '/';
    return;
  }

  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token);
        window.location.href = '/game.html';
      } else {
        console.error('Token error:', data);
        alert('Fout bij ophalen van token.');
      }
    })
    .catch(err => {
      console.error('Token fetch error:', err);
      alert('Netwerkfout bij Spotify login.');
    });
};
