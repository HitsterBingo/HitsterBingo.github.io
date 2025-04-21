const clientId = '2c5922b245944d7087cacfc63872f736';
const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/';
const scopes = 'streaming user-read-email user-read-private';

let accessToken = localStorage.getItem('spotify_token');

// Spotify login
function redirectToSpotifyAuth() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
  window.location = authUrl;
}

// Check token in URL (na login)
function checkForAccessToken() {
  if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    accessToken = params.get('access_token');
    localStorage.setItem('spotify_token', accessToken);
    window.location.hash = '';
  }
}

function updateStatus(text) {
  document.getElementById('status').textContent = text;
}

function initSpotifyPlayer() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: 'Hitster Web Player',
      getOAuthToken: cb => cb(accessToken),
      volume: 0.8
    });

    player.addListener('ready', ({ device_id }) => {
      updateStatus('Verbonden met Spotify!');
      document.getElementById('startScanBtn').disabled = false;

      // Start QR-scanner
      document.getElementById('startScanBtn').onclick = () => {
        const qrScanner = new Html5Qrcode("qr-reader");
        qrScanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (spotifyUrl) => {
            qrScanner.stop();
            const trackId = spotifyUrl.split("/track/")[1]?.split("?")[0];
            if (trackId) {
              playTrack(trackId, device_id);
            } else {
              alert("Ongeldige Spotify-tracklink!");
            }
          }
        );
      };
    });

    player.addListener('initialization_error', e => console.error(e));
    player.addListener('authentication_error', e => {
      console.error(e);
      localStorage.removeItem('spotify_token');
      updateStatus("Authenticatiefout. Log opnieuw in.");
    });

    player.connect();
  };

  const script = document.createElement('script');
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  document.body.appendChild(script);
}

function playTrack(trackId, deviceId) {
  fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: [`spotify:track:${trackId}`]
    })
  }).then(res => {
    if (res.ok) {
      updateStatus("Track wordt afgespeeld!");
    } else {
      updateStatus("Kan track niet afspelen.");
    }
  });
}

document.getElementById('loginBtn').onclick = redirectToSpotifyAuth;
checkForAccessToken();

if (accessToken) {
  updateStatus("Token gevonden! Initialiseren...");
  initSpotifyPlayer();
} else {
  updateStatus("Niet verbonden met Spotify.");
}
