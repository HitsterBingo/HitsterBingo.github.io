fetch('categories.json')
  .then(res => res.json())
  .then(data => {
    Object.entries(data).forEach(([cat, nummers]) => {
      const btn = document.createElement('button');
      btn.textContent = `${cat} (${nummers.length} nummers)`;
      btn.onclick = () => generatePdf(cat, nummers.slice(0, 50)); // max 50
      document.getElementById('buttons').appendChild(btn);
    });
  });

function generatePdf(cat, items) {
  const container = document.createElement('div');
  container.className = 'print-area';

  items.forEach(item => {
    const front = document.createElement('div');
    front.className = 'card card-front';
    const qr = document.createElement('img');
    qr.crossOrigin = 'anonymous';
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.url)}`;
    front.appendChild(qr);
    front.appendChild(document.createTextNode('Scan mij!'));
    container.appendChild(front);

    const back = document.createElement('div');
    back.className = 'card card-back';
    back.innerHTML = `
      <div class="title">${item.title}</div>
      <div class="artist">${item.artist}</div>
      <div class="release">${item.release}</div>
    `;
    container.appendChild(back);
  });

  document.body.appendChild(container);

  const allImgs = container.querySelectorAll('img');
  Promise.all(Array.from(allImgs).map(img =>
    img.complete ? Promise.resolve() : new Promise(res => img.onload = res)
  )).then(() => {
    html2pdf()
      .set({ filename: `${cat}-kaartjes.pdf`, html2canvas: { scale: 2, useCORS: true } })
      .from(container)
      .save()
      .then(() => container.remove());
  });
}
