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
const scanModeBtn     = document.getElementById('mode-scan');
const catModeBtn      = document.getElementById('mode-cat');
const playlistModeBtn = document.getElementById('mode-playlist');

const scanSection     = document.getElementById('scanner-section');
const catSection      = document.getElementById('categories-section');
const playlistSection = document.getElementById('playlist-section');

function hideAll() {
  scanSection.style.display = 'none';
  catSection.style.display  = 'none';
  playlistSection.style.display = 'none';
}

scanModeBtn.addEventListener('click', () => {
  hideAll();
  scanSection.style.display = 'block';
});
catModeBtn.addEventListener('click', () => {
  hideAll();
  catSection.style.display = 'block';
});
playlistModeBtn.addEventListener('click', () => {
  hideAll();
  playlistSection.style.display = 'block';
});

// 3. QR scanner
const html5QrCode = new Html5Qrcode('qr-reader');
document.getElementById('start-scan').addEventListener('click', () => {
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 250 },
    decoded => {
      if (decoded.includes('youtube.com/watch?v=')) {
        const url = new URL(decoded);
        const v = url.searchParams.get('v');
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
  .catch(err => console.error('Kan categories.json niet laden:', err));

function renderCategoryButtons() {
  const catsDiv = document.getElementById('categories');
  Object.keys(categories).forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.classList.add('cat-btn');
    btn.onclick = () => showTracks(cat);
    catsDiv.appendChild(btn);
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

// 5. Playlist loader
document.getElementById('load-playlist').addEventListener('click', () => {
  const url = document.getElementById('playlist-url').value;
  try {
    const parsed = new URL(url);
    const listId = parsed.searchParams.get('list');
    if (!listId) throw new Error('Geen playlist ID gevonden');
    // Laad de hele playlist in de player
    player.loadPlaylist({
      listType: 'playlist',
      list: listId,
      index: 0,
      startSeconds: 0,
      suggestedQuality: 'default'
    });
    player.playVideo();
  } catch (e) {
    alert('Ongeldige playlist URL');
    console.error(e);
  }
});

// Init: start in scan‑modus
hideAll();
scanSection.style.display = 'block';
