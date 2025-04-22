// app.js

// 1. YouTube IFrame API callback
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: '',
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 }
  });
}

// 2. Mode toggling
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

// init in scan‑mode
hideAll();
scanSec.style.display = 'block';

// 3. QR scanner
const html5QrCode = new Html5Qrcode('qr-reader');
document.getElementById('start-scan').addEventListener('click', () => {
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 250 },
    decoded => {
      if (decoded.includes('youtube.com/watch?')) {
        const url = new URL(decoded);
        const v   = url.searchParams.get('v');
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

// 4. Load categories.json
let categories = {};
fetch('categories.json')
  .then(r => r.json())
  .then(data => {
    categories = data;
    renderCategoryButtons();
  })
  .catch(err => console.error('Kon categories niet laden:', err));

function renderCategoryButtons() {
  const container = document.getElementById('categories');
  Object.entries(categories).forEach(([cat, val]) => {
    const btn = document.createElement('button');
    btn.textContent   = cat;
    btn.classList.add('cat-btn');
    btn.onclick = () => {
      if (typeof val === 'string') {
        // val is een playlist-URL
        const listId = new URL(val).searchParams.get('list');
        player.loadPlaylist({ listType: 'playlist', list: listId, index: 0 });
        player.playVideo();
      } else {
        // val is array met losse nummers
        showTracks(cat);
      }
    };
    container.appendChild(btn);
  });
}

function showTracks(cat) {
  const tc = document.getElementById('tracks-container');
  tc.innerHTML = '';
  categories[cat].forEach((t,i) => {
    const item = document.createElement('div');
    item.classList.add('track-item');
    item.innerHTML = `
      <button class="reveal-btn">Track ${i+1}: Ontdek</button>
      <div class="info" style="display:none;">
        <p><strong>${t.title}</strong> – ${t.artist} (<em>${t.release}</em>)</p>
        <button class="play-btn">▶️ Speel af</button>
      </div>
    `;
    item.querySelector('.reveal-btn').onclick = () => {
      item.querySelector('.info').style.display = 'block';
    };
    item.querySelector('.play-btn').onclick = () => {
      player.loadVideoById(t.videoId);
      player.playVideo();
    };
    tc.appendChild(item);
  });
}

// 5. Playlist loader (handmatig plakken)
document.getElementById('load-playlist').addEventListener('click', () => {
  const raw = document.getElementById('playlist-url').value;
  try {
    const u      = new URL(raw);
    const listId = u.searchParams.get('list');
    if (!listId) throw new Error();
    player.loadPlaylist({ listType:'playlist', list:listId, index:0 });
    player.playVideo();
  } catch {
    alert('Ongeldige playlist-URL');
  }
});
