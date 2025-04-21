const clientId = "2c5922b245944d7087cacfc63872f736";
const redirectUri = "https://transcendent-cranachan-74e40a.netlify.app/callback/";

const loginBtn = document.getElementById("loginBtn");
const statusDiv = document.getElementById("status");

const storedToken = localStorage.getItem("access_token");

if (storedToken) {
  statusDiv.textContent = "✅ Ingelogd op Spotify!";
} else {
  loginBtn.addEventListener("click", async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("code_verifier", codeVerifier);

    const scope = "user-read-private user-read-email";
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

    window.location.href = authUrl;
  });
}
