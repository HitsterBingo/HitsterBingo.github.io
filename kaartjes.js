fetch('categories.json')
  .then(r => r.json())
  .then(categories => {
    const btns = document.getElementById("buttons");
    Object.entries(categories).forEach(([naam, nummers]) => {
      const btn = document.createElement("button");
      btn.textContent = `${naam} (${nummers.length})`;
      btn.onclick = () => generatePdf(naam, nummers.slice(0, 50));
      btns.appendChild(btn);
    });
  });

function generatePdf(cat, items) {
  const container = document.createElement("div");
  container.className = "print-area";

  items.forEach(item => {
    // === VOORKANT ===
    const front = document.createElement("div");
    front.className = "card card-front";

    const qr = document.createElement("img");
    qr.crossOrigin = "anonymous";
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.url)}`;
    front.appendChild(qr);
    container.appendChild(front);

    // === ACHTERKANT ===
    const back = document.createElement("div");
    back.className = "card card-back";
    back.innerHTML = `
      <div class="artist">${item.artist}</div>
      <div class="release">${item.release}</div>
      <div class="title">${item.title}</div>
    `;
    container.appendChild(back);
  });

  document.body.appendChild(container);

  const imgs = container.querySelectorAll("img");
  Promise.all(Array.from(imgs).map(img =>
    img.complete ? Promise.resolve() : new Promise(res => img.onload = res)
  )).then(() => {
    html2pdf()
      .set({ filename: `${cat}-kaartjes.pdf`, html2canvas: { scale: 2, useCORS: true } })
      .from(container)
      .save()
      .then(() => container.remove());
  });
}

