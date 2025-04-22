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
    const card = document.createElement("div");
    card.className = "card";

    const artist = document.createElement("div");
    artist.className = "artist";
    artist.textContent = item.artist;

    const release = document.createElement("div");
    release.className = "release";
    release.textContent = item.release;

    const qr = document.createElement("img");
    qr.crossOrigin = "anonymous";
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.url)}`;

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = item.title;

    card.appendChild(artist);
    card.appendChild(release);
    card.appendChild(qr);
    card.appendChild(title);
    container.appendChild(card);
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
