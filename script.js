const clientId = '2c5922b245944d7087cacfc63872f736';
const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/';
const scopes = 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state';

let accessToken = localStorage.getItem('spotify_token');

// Check if we just returned from Spotify with a token in the URL
if (!accessToken) {
  const hash = window.location.hash;
  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    localStorage.setItem('spotify_token', accessToken);
    // Remove token from the URL
    window.history.replaceState({}, document.title, redirectUri);
  } else {
    // No token present, redirect to Spotify login
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  }
}

// Log the access token for debugging
console.log('Access Token:', accessToken);

// Wait for the document to load before using buttons
document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('play');

  playButton.addEventListener('click', async () => {
    if (!accessToken) {
      alert('No access token found. Please log in again.');
      return;
    }

    const deviceId = await getActiveDeviceId();
    if (!deviceId) {
      alert('No active Spotify player found. Open Spotify on another device and try again.');
      return;
    }

    const trackUri = 'spotify:track:11dFghVXANMlKmJXsNCbNl'; // example track

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

      if (response.ok) {
        console.log('Track is now playing!');
      } else {
        const errorData = await response.json();
        console.warn('Cannot play track, status code:', response.status, 'Error:', errorData);
      }
    } catch (error) {
      console.error('Error while trying to play track:', error);
    }
  });
});

// Fetch active Spotify player (like your phone/desktop app)
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
    console.error('Error fetching devices:', err);
    return null;
  }
}
