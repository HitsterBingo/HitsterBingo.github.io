// Handle the callback from Spotify and exchange code for token
async function handleSpotifyCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code'); // Get authorization code from URL
    const error = urlParams.get('error'); // Handle errors, like 'access_denied'

    if (error) {
        console.error('Spotify authorization error:', error);
        return;
    }

    if (code) {
        // Retrieve code_verifier from localStorage
        const codeVerifier = localStorage.getItem('code_verifier');
        if (!codeVerifier) {
            console.error('Code verifier not found');
            return;
        }

        // Now you need to exchange the code for an access token
        const clientId = '2c5922b245944d7087cacfc63872f736';
        const redirectUri = 'https://transcendent-cranachan-74e40a.netlify.app/callback/';

        const data = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier,
        };

        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + 'YOUR_CLIENT_SECRET'), // Replace with your actual client secret
            },
            body: new URLSearchParams(data),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.access_token) {
            console.log('Access Token:', tokenData.access_token);
            // Store the access token and use it for API requests
            localStorage.setItem('access_token', tokenData.access_token);
        } else {
            console.error('Failed to obtain access token:', tokenData);
        }
    } else {
        console.error('Authorization code not found');
    }
}

// Call the callback handler when the page loads
handleSpotifyCallback();
