// Generate a random string for code_verifier
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate the code_challenge from the code_verifier using SHA-256
async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64Digest;
}

// Get the Spotify authorization URL with PKCE
async function getSpotifyAuthURL() {
    const clientId = '2c5922b245944d7087cacfc63872f736'; // Spotify Client ID
    const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/callback/'; // Your redirect URI
    const scope = 'user-read-private user-read-email'; // Permissions/Scope for Spotify
    const codeVerifier = generateRandomString(128); // Generate the code_verifier
    const codeChallenge = await generateCodeChallenge(codeVerifier); // Generate code_challenge

    // Store code_verifier in localStorage
    localStorage.setItem('code_verifier', codeVerifier);

    // Generate authorization URL
    const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

    // Redirect the user to Spotify's login page
    window.location.href = authURL;
}
