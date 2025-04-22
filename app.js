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

      // 👉 Zoek camera met 'back' of 'rear' in de naam
      let selectedCam = cameras[0].id;
      for (let cam of cameras) {
        if (/back|rear/i.test(cam.label)) {
          selectedCam = cam.id;
          break;
        }
      }

      const config = { fps: 10, qrbox: 250 };
      html5QrCode = new Html5Qrcode('qr-reader');
      return html5QrCode.start(
        { deviceId: { exact: selectedCam } },
        config,
        (decodedText) => {
          const url = new URL(decodedText);
          const videoId = url.searchParams.get("v");
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
        err => console.warn("Scanfout:", err)
      );
    })
    .catch(e => {
      console.error("Kon camera niet starten:", e);
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
