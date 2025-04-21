const clientId = "2c5922b245944d7087cacfc63872f736";
const redirectUri = "https://transcendent-cranachan-74e40a.netlify.app/callback/";

const code = new URLSearchParams(window.location.search).get("code");
const codeVerifier = localStorage.getItem("code_verifier");

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await response.json();

  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    window.location.href = "/";
  } else {
    document.body.innerHTML = `<p>⚠️ Fout bij inloggen: ${data.error_description || data.error}</p>`;
  }
}

if (code) {
  getAccessToken();
} else {
  document.body.innerHTML = "<p>⚠️ Geen code ontvangen.</p>";
}
