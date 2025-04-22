console.log("✅ app.js is geladen");

let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '1',
    width: '1',
    videoId: '',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    }
  });
}

let html5QrCode, lastVideoId = null;
const startBtn  = document.getElementById('start-scan'),
      playBtn   = document.getElementById('play-video'),
      rescanBtn = document.getElementById('rescan');

function stopVideoIfPlaying() {
  if (player && player.stopVideo) {
    player.stopVideo();
  }
}

function extractVideoId(text) {
  try {
    const url = new URL(text);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }
}

function startScan() {
  stopVideoIfPlaying();
  lastVideoId = null;

  playBtn.style.display   = 'none';
  rescanBtn.style.display = 'none';
  startBtn.style.display  = 'inline-block';

  if (html5QrCode && html5QrCode._isScanning) {
    html5QrCode.stop().catch(() => {});
  }

  Html5Qrcode.getCameras()
    .then(cameras => {
      if (!cameras || cameras.length === 0) {
        alert("Geen camera gevonden");
        return;
      }

      // Kies achterste camera, of fallback
      let selectedCam = cameras[0].id;
      for (let cam of cameras) {
        if (/back|rear/i.test(cam.label)) {
          selectedCam = cam.id;
          break;
        }
      }

      const config = { fps: 10, qrbox: 250 };
      html5QrCode = new Html5Qrcode('qr-reader');

      html5QrCode.start(
        { deviceId: { exact: selectedCam } },
        config,
        (decodedText) => {
          console.log("📦 QR-code gescand:", decodedText);
          const videoId = extractVideoId(decodedText);
          console.log("🎬 videoId:", videoId);

          if (videoId) {
            lastVideoId = videoId;
            if (html5QrCode._isScanning) {
              html5QrCode.stop().then(() => {
                startBtn.style.display  = 'none';
                playBtn.style.display   = 'inline-block';
                rescanBtn.style.display = 'inline-block';
              });
            }
          }
        },
        err => {
          console.warn("Scanfout:", err);
        }
      );
    })
    .catch(e => {
      console.error("Camera starten mislukt:", e);
      alert("Camera starten mislukt.");
    });
}

startBtn.onclick  = startScan;
rescanBtn.onclick = startScan;

playBtn.onclick = () => {
  if (lastVideoId && player) {
    console.log("▶️ Playing:", lastVideoId);
    player.loadVideoById(lastVideoId);
    player.playVideo();
  }
};
