// app.js

// === 1. YouTube IFrame API setup ===
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: '',
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
scanBtn.addEventListener('click', () => { hideAll(); scanSec.style.display = 'block'; });
catBtn .addEventListener('click', () => { hideAll(); catSec .style.display = 'block'; });
playlistBtn.addEventListener('click', () => { hideAll(); playSec.style.display = 'block'; });

// start in scan‑modus
hideAll();
scanSec.style.display = 'block';

// === 3. QR‑scanner ===
const html5QrCode = new Html5Qrcode('qr-reader');
document.getElementById('start-scan').addEventListener('click', () => {
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 250 },
    decoded => {
      if (decoded.includes('youtube.com/watch?')) {
        const v = new URL(decoded).searchParams.get('v');
        if (v) {
          html5QrCode.stop();
          player.loadVideoById(v);
          player.playVideo();
        }
      }
    },
    err => console.warn('Scan error:', err)
  ).catch(err => console.error('Camera error:', err));
});

// === 4. Categorieën inladen ===
let categories = {};
fetch('categories.json')
  .then(r => r.json())
  .then(data => {
    categories = data;
    renderCategoryButtons();
  })
  .catch(err => console.error('Kon categories niet laden:', err));

function renderCategoryButtons() {
  const cdiv = document.getElementById('categories');
  cdiv.innerHTML = '';
  Object.keys(categories).forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent   = cat;
    btn.classList.add('cat-btn');
    btn.onclick = () => selectCategory(cat);
    cdiv.appendChild(btn);
  });
}

let currentCat = '';
function selectCategory(cat) {
  currentCat = cat;
  document.getElementById('tracks-container').innerHTML = '';
  document.getElementById('generate-pdf').style.display = 'inline-block';
}

// === 5. PDF‑generatie ===
document.getElementById('generate-pdf').addEventListener('click', () => {
  const data = categories[currentCat];
  if (!Array.isArray(data)) return alert('Deze categorie ondersteunt geen PDF-kaartjes.');

  // bouw een hidden print‑container
  const container = document.createElement('div');
  container.classList.add('print-area');

  data.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');
    // gebruik gratis QR‑API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(item.url)}`;
    card.innerHTML = `
      <img src="${qrUrl}" alt="QR voor ${item.title}"/>
      <div class="title">${item.title}</div>
      <div class="artist">${item.artist}</div>
      <div class="release">${item.release}</div>
    `;
    container.appendChild(card);
  });

  document.body.appendChild(container);
  // html2pdf.js opties
  html2pdf()
    .set({ margin: 10, filename: `${currentCat}.pdf`, html2canvas: { scale: 2 } })
    .from(container)
    .save()
    .then(() => container.remove());
});

// === 6. Playlist loader ===
document.getElementById('load-playlist').addEventListener('click', () => {
  const raw = document.getElementById('playlist-url').value;
  try {
    const listId = new URL(raw).searchParams.get('list');
    if (!listId) throw '';
    player.loadPlaylist({ listType:'playlist', list:listId, index:0 });
    player.playVideo();
  } catch {
    alert('Ongeldige playlist-URL');
  }
});
