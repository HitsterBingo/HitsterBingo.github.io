const clientId = '2c5922b245944d7087cacfc63872f736';
const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/';
const scopes = 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state';

let accessToken = localStorage.getItem('spotify_token');

// Kijken of we net terugkomen van Spotify met een token in de URL
if (!accessToken) {
  const hash = window.location.hash;
  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    localStorage.setItem('spotify_token', accessToken);
    // Verwijder token uit de URL
    window.history.replaceState({}, document.title, redirectUri);
  } else {
    // Geen token aanwezig, dus doorsturen naar Spotify login
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  }
}

// Wachten tot document geladen is voor we knoppen gebruiken
document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('play');

  playButton.addEventListener('click', async () => {
    if (!accessToken) {
      alert('Geen toegangstoken gevonden. Probeer opnieuw in te loggen.');
      return;
    }

    const deviceId = await getActiveDeviceId();
    if (!deviceId) {
      alert('Geen actieve Spotify-speler gevonden. Open Spotify op een ander apparaat en probeer opnieuw.');
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
        console.log('Track wordt afgespeeld!');
      } else {
        console.warn('Kan niet afspelen, statuscode:', response.status);
      }
    } catch (error) {
      console.error('Fout bij afspelen:', error);
    }
  });
});

// Ophalen van actieve Spotify player (zoals je telefoon/desktop app)
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
    console.error('Fout bij ophalen van apparaten:', err);
    return null;
  }
}