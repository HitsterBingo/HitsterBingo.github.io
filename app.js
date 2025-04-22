// 1. YouTube IFrame API & off‑screen player
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '1',
    width:  '1',
    videoId: '',
    playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
    events: {
      onReady: () => console.log('YT Player klaar')
    }
  });
}

// 2. Modus‑toggle
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
scanBtn.addEventListener('click',     ()=>{hideAll();scanSec.style.display='block';});
catBtn.addEventListener('click',      ()=>{hideAll();catSec.style.display='block';});
playlistBtn.addEventListener('click', ()=>{hideAll();playSec.style.display='block';});
// start in scan‑modus
hideAll();
scanSec.style.display = 'block';

// 3. QR‑scanner + Play knop
let html5QrCode, lastVideoId=null;
const startBtn = document.getElementById('start-scan');
const playBtn  = document.getElementById('play-video');

startBtn.addEventListener('click', () => {
  lastVideoId = null;
  playBtn.style.display  = 'none';
  startBtn.style.display = 'inline-block';
  if (html5QrCode) html5QrCode.stop().catch(()=>{});

  Html5Qrcode.getCameras()
    .then(cams => {
      const cfg = cams.length
        ? { deviceId: { exact: cams[0].id } }
        : { facingMode: 'environment' };
      html5QrCode = new Html5Qrcode('qr-reader');
      return html5QrCode.start(
        cfg,
        { fps: 10 },
        decoded => {
          const v = new URL(decoded).searchParams.get('v');
          if (v) {
            lastVideoId = v;
            html5QrCode.stop();
            startBtn.style.display = 'none';
            playBtn.style.display  = 'inline-block';
          }
        },
        err => console.warn('Scan error', err)
      );
    })
    .catch(e => {console.error(e);alert('Camera fout');});
});

playBtn.addEventListener('click', () => {
  if (lastVideoId && player) {
    player.loadVideoById(lastVideoId);
    player.playVideo();
  }
});

// 4. Categorieën laden & PDF‑generator
let categories = {};
fetch('categories.json')
  .then(r=>r.json())
  .then(data=>{ categories=data; renderCategoryButtons(); })
  .catch(e=>console.error('Kon categories.json niet laden',e));

function renderCategoryButtons(){
  const cdiv = document.getElementById('categories');
  cdiv.innerHTML = '';
  Object.keys(categories).forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => generatePdfForCategory(cat);
    cdiv.appendChild(btn);
  });
}

function generatePdfForCategory(cat){
  const items = categories[cat];
  if (!Array.isArray(items)) {
    return alert(`Categorie “${cat}” ondersteunt nog geen kaartjes.`);
  }
  const container = document.createElement('div');
  container.className = 'print-area';

  items.forEach(item=>{
    const front = document.createElement('div');
    front.className = 'card card-front';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.url)}`;
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = qrUrl;
    front.append(img, document.createTextNode('Scan mij!'));

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
  const imgs = Array.from(container.querySelectorAll('img'));
  Promise.all(imgs.map(i=>new Promise(r=>i.complete? r(): i.onload = r)))
    .then(()=> html2pdf()
      .set({ margin:10, filename:`${cat}.pdf`, html2canvas:{scale:2, useCORS:true} })
      .from(container).save()
    )
    .then(()=>container.remove())
    .catch(e=>{
      console.error('PDF fout',e);
      alert('PDF genereren mislukt');
      container.remove();
    });
}

// 5. Playlist loader
document.getElementById('load-playlist').addEventListener('click',()=>{
  const raw = document.getElementById('playlist-url').value;
  try {
    const listId = new URL(raw).searchParams.get('list');
    if(!listId) throw '';
    player.loadPlaylist({ listType:'playlist', list:listId, index:0 });
    player.playVideo();
  } catch {
    alert('Ongeldige playlist‑URL');
  }
});
