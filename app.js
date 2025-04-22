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

function startScan() {
  lastVideoId = null;
  playBtn.style.display   = 'none';
  rescanBtn.style.display = 'none';
  startBtn.style.display  = 'inline-block';

  // Stop vorige scanner als die nog draait
  if (html5QrCode && html5QrCode._isScanning) {
    html5QrCode.stop().catch(() => {});
  }

  // Gebruik de achtercamera
  const config = {
    fps: 10,
    qrbox: 250
  };

  html5QrCode = new Html5Qrcode('qr-reader');
  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      const url = new URL(decodedText);
      const videoId = url.searchParams.get("v");
      if (videoId) {
        lastVideoId = videoId;
        html5QrCode.stop().then(() => {
          startBtn.style.display  = 'none';
          playBtn.style.display   = 'inline-block';
          rescanBtn.style.display = 'inline-block';
        });
      }
    },
    (error) => {
      console.warn("Scanfout:", error);
    }
  ).catch((err) => {
    console.error("Start scanner mislukt:", err);
    alert("Kon camera niet starten.");
  });
}

startBtn.onclick  = startScan;
rescanBtn.onclick = startScan;

playBtn.onclick = () => {
  if (lastVideoId && player) {
    player.loadVideoById(lastVideoId);
    player.playVideo();
  }
};
