// === 1. YouTube IFrame API setup ===
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '315', width: '560', videoId: '',
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 }
  });
}

// === 2. Modus‑toggle ===
const scanBtn     = document.getElementById('mode-scan');
const catBtn      = document.getElementById('mode-cat');
const playlistBtn = document.getElementById('mode-playlist');
const scanSec     = document.getElementById('scanner-section');
const catSec      = document.getElementById('categories-section');
const playSec     = document.getElementById('playlist-section');

function hideAll() {
  scanSec.style.display = 'none';
  catSec.style.display  = 'none';
  playSec.style.display = 'none';
}
scanBtn.addEventListener('click',     () => { hideAll(); scanSec.style.display     = 'block'; });
catBtn.addEventListener('click',      () => { hideAll(); catSec .style.display     = 'block'; });
playlistBtn.addEventListener('click', () => { hideAll(); playSec.style.display    = 'block'; });
// Start in scan‑modus
hideAll();
scanSec.style.display = 'block';

// === 3. QR‑scanner + Play Button ===
let html5QrCode;
let lastVideoId = null;
const startBtn = document.getElementById('start-scan');
const playBtn  = document.getElementById('play-video');

// Start scannen
startBtn.addEventListener('click', () => {
  // reset
  lastVideoId = null;
  playBtn.style.display  = 'none';
  startBtn.style.display = 'inline-block';

  // stop eerdere scanner
  if (html5QrCode) html5QrCode.stop().catch(()=>{});
  Html5Qrcode.getCameras()
    .then(cameras => {
      const cfg = cameras.length
        ? { deviceId: { exact: cameras[0].id } }
        : { facingMode: 'environment' };
      html5QrCode = new Html5Qrcode('qr-reader');
      return html5QrCode.start(
        cfg,
        { fps: 10 },
        decoded => {
          if (decoded.includes('youtube.com/watch?')) {
            const vid = new URL(decoded).searchParams.get('v');
            if (vid) {
              lastVideoId = vid;
              html5QrCode.stop();
              startBtn.style.display = 'none';
              playBtn.style.display  = 'inline-block';
            }
          }
        },
        err => console.warn('Scan error:', err)
      );
    })
    .catch(err => { console.error(err); alert('Kon camera niet starten'); });
});

// Play knop
playBtn.addEventListener('click', () => {
  if (lastVideoId && player) {
    player.loadVideoById(lastVideoId);
    player.playVideo();
  }
});

// === 4. Categorieën inladen & PDF maker ===
let categories = {};
fetch('categories.json')
  .then(r => r.json())
  .then(data => { categories = data; renderCategoryButtons(); })
  .catch(err => console.error('Kon categories.json niet laden:', err));

function renderCategoryButtons() {
  const cdiv = document.getElementById('categories');
  cdiv.innerHTML = '';
  Object.keys(categories).forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => generatePdfForCategory(cat);
    cdiv.appendChild(btn);
  });
}

function generatePdfForCategory(cat) {
  const items = categories[cat];
  if (!Array.isArray(items)) {
    return alert(`Categorie “${cat}” ondersteunt geen kaartjes.`);
  }

  // Maak container voor kaartjes
  const container = document.createElement('div');
  container.className = 'print-area';

  items.forEach(item => {
    // Front
    const front = document.createElement('div');
    front.className = 'card card-front';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.url)}`;
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = qrUrl;
    front.append(img, document.createTextNode('Scan mij!'));

    // Back
    const back = document.createElement('div');
    back.className = 'card card-back';
    back.innerHTML = `
      <div class="title">${item.title}</div>
      <div class="artist">${item.artist}</div>
      <div class="release">${item.release}</div>
    `;

    container.append(front, back);
  });

  document.body.appendChild(container);

  // Wacht tot alle QR‑img geladen
  const imgs = Array.from(container.querySelectorAll('img'));
  Promise.all(imgs.map(i => new Promise(r => i.complete ? r() : i.onload = r)))
    .then(() => html2pdf()
      .set({ margin:10, filename:`${cat}.pdf`, html2canvas:{ scale:2, useCORS:true }})
      .from(container).save()
    )
    .then(() => container.remove())
    .catch(err => {
      console.error('PDF fout:', err);
      alert('PDF genereren mislukt');
      container.remove();
    });
}

// === 5. Playlist loader (optioneel) ===
document.getElementById('load-playlist').addEventListener('click', () => {
  const raw = document.getElementById('playlist-url').value;
  try {
    const listId = new URL(raw).searchParams.get('list');
    if (!listId) throw '';
    player.loadPlaylist({ listType:'playlist', list:listId, index:0 });
    player.playVideo();
  } catch {
    alert('Ongeldige playlist‑URL');
  }
});
