// 1. YouTube IFrame API initialiseren
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '1', width: '1', videoId: '',
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 }
  });
}

// 2. Modus‑switch
const btnScan     = document.getElementById('btn-scan'),
      btnCat      = document.getElementById('btn-cat'),
      btnPlaylist = document.getElementById('btn-playlist'),
      secScan     = document.getElementById('scanner-section'),
      secCat      = document.getElementById('categories-section'),
      secPlaylist = document.getElementById('playlist-section');
function hideAll() {
  secScan.style.display = 'none';
  secCat.style.display  = 'none';
  secPlaylist.style.display = 'none';
}
btnScan.onclick     = () => { hideAll(); secScan.style.display     = 'block'; };
btnCat.onclick      = () => { hideAll(); secCat.style.display      = 'block'; };
btnPlaylist.onclick = () => { hideAll(); secPlaylist.style.display = 'block'; };
// start in scan‑modus
hideAll(); secScan.style.display = 'block';

// 3. QR‑scanner + Play + Rescan
let html5QrCode, lastVid = null;
const startBtn = document.getElementById('start-scan'),
      playBtn  = document.getElementById('play-video'),
      rescanBtn= document.getElementById('rescan');

startBtn.onclick = startScan;
rescanBtn.onclick = startScan;
playBtn.onclick = () => {
  if (lastVid && player) {
    player.loadVideoById(lastVid);
    player.playVideo();
  }
};

function startScan() {
  lastVid = null;
  playBtn.style.display   = 'none';
  rescanBtn.style.display = 'none';
  startBtn.style.display  = 'inline-block';

  if (html5QrCode) html5QrCode.stop().catch(()=>{});
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
          const v = new URL(decoded).searchParams.get('v');
          if (v) {
            lastVid = v;
            html5QrCode.stop();
            startBtn.style.display   = 'none';
            playBtn.style.display    = 'inline-block';
            rescanBtn.style.display  = 'inline-block';
          }
        },
        err => console.warn('Scan error:', err)
      );
    })
    .catch(e => alert('Kon camera niet starten'));
}

// 4. Categorieën inladen & PDF‑maker
let categories = {};
fetch('categories.json')
  .then(r => r.json())
  .then(data => {
    categories = data;
    const cdiv = document.getElementById('categories');
    cdiv.innerHTML = '';
    Object.keys(categories).forEach(cat => {
      const b = document.createElement('button');
      b.textContent = cat;
      b.onclick = () => makePDF(cat, categories[cat]);
      cdiv.appendChild(b);
    });
  })
  .catch(e => alert('Kon categories.json niet laden'));

function makePDF(catName, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return alert(`Categorie "${catName}" heeft geen items.`);
  }
  // Container
  const ctr = document.createElement('div');
  ctr.className = 'print-area';
  document.body.appendChild(ctr);

  items.forEach(it => {
    // Front
    const f = document.createElement('div');
    f.className = 'card card-front';
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(it.url)}`;
    f.appendChild(img);
    f.append('Scan mij!');
    // Back
    const b = document.createElement('div');
    b.className = 'card card-back';
    b.innerHTML = `
      <div class="title">${it.title}</div>
      <div class="artist">${it.artist}</div>
      <div class="release">${it.release}</div>
    `;
    ctr.appendChild(f);
    ctr.appendChild(b);
  });

  // Wacht tot alle QR‑img geladen
  const imgs = ctr.querySelectorAll('img');
  Promise.all(Array.from(imgs).map(i => i.complete ? Promise.resolve() : new Promise(r => i.onload = r)))
    .then(() => html2pdf().set({ filename: `${catName}.pdf`, margin:10, html2canvas:{ scale:2, useCORS:true } }).from(ctr).save())
    .then(() => ctr.remove())
    .catch(() => { alert('PDF genereren mislukt'); ctr.remove(); });
}

// 5. Playlist loader
document.getElementById('load-playlist').onclick = () => {
  try {
    const raw = document.getElementById('playlist-url').value;
    const listId = new URL(raw).searchParams.get('list');
    if (!listId) throw '';
    player.loadPlaylist({ listType:'playlist', list:listId, index:0 });
    player.playVideo();
  } catch {
    alert
