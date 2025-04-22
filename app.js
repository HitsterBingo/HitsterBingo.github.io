console.log("✅ app.js is geladen");

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 DOM geladen");

  const btn = document.getElementById("btn-scan");
  if (btn) {
    btn.onclick = () => {
      alert("👋 Scan-knop werkt!");
    };
  } else {
    console.warn("❌ btn-scan niet gevonden!");
  }
});
