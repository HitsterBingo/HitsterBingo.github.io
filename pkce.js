// Functie om een random string te genereren voor de code_verifier
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Functie om de SHA-256 hash te berekenen en de code_challenge te maken
async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64Digest;
}

// Functie om Spotify autorisatie URL te genereren met PKCE
async function getSpotifyAuthURL() {
    const clientId = '2c5922b245944d7087cacfc63872f736'; // Je Spotify Client ID
    const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/callback/'; // Redirect URI
    const scope = 'user-read-private user-read-email'; // Scope voor Spotify
    const codeVerifier = generateRandomString(128); // Genereer een code_verifier
    const codeChallenge = await generateCodeChallenge(codeVerifier); // Genereer code_challenge
    
    // Sla de code_verifier op in de lokale opslag (localStorage)
    localStorage.setItem('code_verifier', codeVerifier);

    // Spotify autorisatie URL
    const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    
    // Redirect de gebruiker naar de Spotify login pagina
    window.location.href = authURL;
}

// Aanroepen van de functie
getSpotifyAuthURL();
