let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '1',
    width: '1',
    videoId: '',
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    }
  });
}

let html5QrCode = null;
let lastVideoId = null;

const startBtn = document.getElementById("start-scan");
const playBtn = document.getElementById("play-video");
const rescanBtn = document.getElementById("rescan");

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
  playBtn.style.display = "none";
  rescanBtn.style.display = "none";
  startBtn.style.display = "inline-block";

  if (html5QrCode && html5QrCode._isScanning) {
    html5QrCode.stop().catch(() => {});
  }

  Html5Qrcode.getCameras().then(cameras => {
    if (!cameras || cameras.length === 0) {
      alert("Geen camera gevonden");
      return;
    }

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
        const videoId = extractVideoId(decodedText);
        if (videoId) {
          lastVideoId = videoId;
          html5QrCode.stop().then(() => {
            startBtn.style.display = "none";
            playBtn.style.display = "inline-block";
            rescanBtn.style.display = "inline-block";
          });
        }
      },
      (error) => {
        console.warn("Scan error", error);
      }
    );
  }).catch(err => {
    console.error("Camera fout:", err);
    alert("Kon camera niet starten.");
  });
}

startBtn.onclick = startScan;
rescanBtn.onclick = startScan;

playBtn.onclick = () => {
  if (lastVideoId && player && player.loadVideoById) {
    player.loadVideoById(lastVideoId);
    player.playVideo();
  }
};
