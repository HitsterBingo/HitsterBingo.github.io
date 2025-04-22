const token = localStorage.getItem("spotify_access_token");
if (!token) {
  window.location.href = "/";
}

let player;
window.onSpotifyWebPlaybackSDKReady = () => {
  player = new Spotify.Player({
    name: 'Hitster Game Player',
    getOAuthToken: cb => { cb(token); },
    volume: 0.5
  });

  player.connect();
};

function startScanner() {
  const html5QrCode = new Html5Qrcode("video");
  const qrConfig = { fps: 10, qrbox: 250 };

  html5QrCode.start({ facingMode: "environment" }, qrConfig, (decodedText) => {
    if (decodedText.includes("spotify.com/track/")) {
      const trackId = decodedText.split("/track/")[1].split("?")[0];
      playTrack(trackId);
      html5QrCode.stop();
    }
  }, (err) => {
    console.warn("QR scan error", err);
  });
}

function playTrack(trackId) {
  fetch("https://api.spotify.com/v1/me/player/play", {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
  }).then(res => {
    if (res.ok) {
      console.log("Track playing");
    } else {
      console.error("Failed to play track");
    }
  });
}

startScanner();
