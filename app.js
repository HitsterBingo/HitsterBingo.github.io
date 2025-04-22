// === 1. YouTube IFrame API setup ===
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '1',
    width: '1',
    videoId: '',
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 }
  });
}

// === 2. Modus‑toggle ===
const btnScan     = document.getElementById('btn-scan'),
      btnCat      = document.getElementById('btn-cat'),
      btnPlaylist = document.getElementById('btn-playlist'),
      secScan     = document.getElementById('scanner-section'),
      secCat      = document.getElementById('categories-section'),
      secPlaylist = document.getElementById('playlist-section');

function hideAll() {
  secScan.style.display     = 'none';
  secCat.style.display      = 'none';
  secPlaylist.style.display = 'none';
}

btnScan.onclick     = () => { hideAll(); secScan.style.display     = 'block'; };
btnCat.onclick      = () => { hideAll(); secCat.style.display      = 'block'; };
btnPlaylist.onclick = () => { hideAll(); secPlaylist.style.display = 'block'; };

hideAll();
secScan.style.display = 'block';

// === 3. QR‑scanner + Play/Rescan ===
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

// === 4. Categorieën laden & PDF‑maker ===
let categories = {};
fetch('categories.json')
  .then(r => r.json())
  .then(data => {
    categories = data;
    renderCategoryButtons();
  })
  .catch(err => console.error('Kon categories.json niet laden', err));

function renderCategoryButtons() {
  const cdiv = document.getElementById('categories');
  cdiv.innerHTML = '';
  Object.keys(categories).forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick     = () => generatePdfForCategory(cat);
    cdiv.appendChild(btn);
  });
}

function generatePdfForCategory(cat) {
  const items = categories[cat];
  if (!Array.isArray(items) || items.length === 0) {
    return alert(`Categorie "${cat}" heeft geen kaartjes.`);
  }
  const container = document.createElement('div');
  container.className = 'print-area';

  items.forEach(item => {
    const front = document.createElement('div');
    front.className = 'card card-front';
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.url)}`;
    front.appendChild(img);
    front.appendChild(document.createTextNode('Scan mij!'));

    const back = document.createElement('div');
    back.className = 'card card-back';
    back.innerHTML = `
      <div class="title">${item.title}</div>
      <div class="artist">${item.artist}</div>
      <div class="release">${item.release}</div>
    `;
    container.appendChild(front);
    container.appendChild(back);
  });

  document.body.appendChild(container);
  const imgs = container.querySelectorAll('img');
  Promise.all(Array.from(imgs).map(i =>
    i.complete ? Promise.resolve() : new Promise(res => i.onload = res)
  )).then(() => {
    html2pdf()
      .set({ filename: `${cat}.pdf`, margin: 10, html2canvas: { scale: 2, useCORS: true } })
      .from(container)
      .save()
      .then(() => container.remove());
  }).catch(err => {
    console.error('PDF genereren mislukt', err);
    alert('PDF genereren mislukt');
    container.remove();
  });
}

// === 5. Playlist loader ===
document.getElementById('load-playlist').onclick = () => {
  const raw = document.getElementById('playlist-url').value.trim();
  try {
    const listId = new URL(raw).searchParams.get('list');
    if (!listId) throw 'Geen list param';
    player.loadPlaylist({ listType: 'playlist', list: listId, index: 0 });
    player.playVideo();
  } catch {
    alert('Ongeldige playlist-URL');
  }
};
