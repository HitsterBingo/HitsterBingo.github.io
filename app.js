console.log("✅ app.js is geladen");

let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '1',
    width: '1',
    videoId: '',
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 }
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

  if (html5QrCode) html5QrCode.stop().catch(() => {});

  Html5Qrcode.getCameras()
    .then(cams => {
      const cfg = cams[0]
        ? { deviceId: { exact: cams[0].id } }
        : { facingMode: 'environment' };

      html5QrCode = new Html5Qrcode('qr-reader');
      return html5QrCode.start(
        cfg,
        { fps: 10 },
        decoded => {
          const vid = new URL(decoded).searchParams.get('v');
          if (vid) {
            lastVideoId = vid;
            html5QrCode.stop();
            startBtn.style.display  = 'none';
            playBtn.style.display   = 'inline-block';
            rescanBtn.style.display = 'inline-block';
          }
        },
        err => console.warn('Scan error', err)
      );
    })
    .catch(e => {
      console.error(e);
      alert('Kon camera niet starten.');
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
