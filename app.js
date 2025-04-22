<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Hitster Playlist naar Kaartjes</title>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script src="https://unpkg.com/html5-qrcode"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
    body {
      background: #121212;
      color: white;
      font-family: sans-serif;
      text-align: center;
      padding: 2rem;
    }

    input[type="text"] {
      width: 80%;
      max-width: 500px;
      padding: 12px;
      font-size: 16px;
      margin-bottom: 10px;
    }

    label, #qr-reader {
      display: block;
      margin: 10px auto;
      font-size: 16px;
    }

    button {
      padding: 12px 24px;
      background: #1db954;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin: 10px 5px;
    }

    .print-area {
      padding: 40px;
      margin: 20px auto;
      max-width: 1100px;
      background: white;
      color: black;
    }

    .page {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: 1fr;
      gap: 20px;
      page-break-after: always;
    }

    .card {
      width: 180px;
      height: 240px;
      border: 1px solid #ccc;
      background: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      position: relative;
      box-sizing: border-box;
    }

    .card img {
      width: 120px;
      height: 120px;
    }

    .card .artist {
      font-size: 14px;
      font-weight: normal;
      margin-bottom: 5px;
    }

    .card .release {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 10px 0;
    }

    .card .title {
      font-size: 14px;
      font-style: italic;
      transform: rotate(-5deg);
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Playlist → Hitster Kaartjes</h1>
  <input type="text" id="playlist-url" placeholder="Plak hier een YouTube-playlist link...">
  <label><input type="checkbox" id="double-sided"> Dubbelzijdig printen</label>
  <button onclick="genereerKaartjes()">🎵 Genereer kaartjes</button>

  <div id="qr-reader" style="width:300px; margin:20px auto;"></div>
  <button id="start-scan">▶️ Scan QR-code</button>
  <button id="play-video" style="display:none;">🎵 Speel video</button>
  <button id="rescan" style="display:none;">🔄 Opnieuw scannen</button>
  <div id="player" style="display:none;"></div>

  <script>
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
  </script>
</body>
</html>
