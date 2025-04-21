const clientId = '2c5922b245944d7087cacfc63872f736';
const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/';
const scopes = 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state';

let accessToken = localStorage.getItem('spotify_token');

// 🔁 Check op fout in URL (bijv. "unsupported_response_type")
const hash = window.location.hash;
const urlParams = new URLSearchParams(hash.substring(1));
const error = urlParams.get('error');

if (error) {
  document.body.innerHTML = `
    <div style="text-align: center; margin-top: 50px; color: white; font-family: sans-serif;">
      <h2>⚠️ Fout bij inloggen met Spotify</h2>
      <p>Spotify gaf de fout: <strong>${error}</strong></p>
      <p>Probeer opnieuw te <a href="#" onclick="retryLogin()">inloggen</a>.</p>
    </div>
  `;
  window.history.replaceState({}, document.title, redirectUri); // verwijder fout uit URL
  throw new Error(`Spotify error: ${error}`);
}

// 🔐 Token uit URL ophalen als die er is
if (!accessToken && hash.includes('access_token')) {
  accessToken = urlParams.get('access_token');
  localStorage.setItem('spotify_token', accessToken);
  window.history.replaceState({}, document.title, redirectUri); // clean URL
}

// 🚪 Als er helemaal geen token is (en ook geen error): redirect naar Spotify login
if (!accessToken && !error) {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  window.location.href = authUrl;
}

// 🎧 Wachten tot pagina geladen is voor knoppen
document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('play');

  if (!playButton) return;

  playButton.addEventListener('click', async () => {
    if (!accessToken) {
      alert('Geen toegangstoken gevonden. Log opnieuw in.');
      return;
    }

    const deviceId = await getActiveDeviceId();
    if (!deviceId) {
      alert('Geen actieve Spotify-speler gevonden. Open Spotify op een apparaat.');
      return;
    }

    const trackUri = 'spotify:track:11dFghVXANMlKmJXsNCbNl'; // voorbeeldtrack

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      if (response.status === 204) {
        console.log('Track afgespeeld!');
      } else {
        console.warn('Kon niet afspelen:', response.status);
      }
    } catch (error) {
      console.error('Fout bij afspelen:', error);
    }
  });
});

// 📱 Ophalen actieve player (zoals telefoon of Spotify desktop)
async function getActiveDeviceId() {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    const active = data.devices.find(d => d.is_active);
    return active ? active.id : null;
  } catch (err) {
    console.error('Fout bij ophalen apparaten:', err);
    return null;
  }
}

// 🔁 Functie om opnieuw in te loggen als je fout krijgt
function retryLogin() {
  localStorage.removeItem('spotify_token');
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  window.location.href = authUrl;
}
