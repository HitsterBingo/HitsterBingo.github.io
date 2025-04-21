window.onload = function() {
    // Haal de parameters uit de URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code'); // Haal de authorization code op uit de URL

    console.log("Authorization code:", code); // Controleer of de code aanwezig is

    if (code) {
        console.log("Code ontvangen. Aanvraag voor access token...");
        
        // Maak de API-aanroep om het access token te verkrijgen
        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code, // De authorization code die we ontvangen van de redirect URL
                redirect_uri: 'https://transcendent-cranachan-74e40a.netlify.app/callback/', // Je geregistreerde redirect URI
                client_id: '2c5922b245944d7087cacfc63872f736', // Vervang met je echte client ID
                code_verifier: localStorage.getItem('code_verifier') // Als je PKCE gebruikt, haal je de code verifier op uit localStorage
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Token response:", data); // Log de response om te zien wat je terugkrijgt
            if (data.access_token) {
                console.log('Access token ontvangen:', data.access_token);
                // Sla het access token op in localStorage
                localStorage.setItem('spotify_access_token', data.access_token);
                // Hier kun je de Spotify API verder gebruiken met het access token
                window.location.href = '/'; // Redirect naar de homepagina of een andere pagina nadat het token is opgeslagen
            } else {
                console.error('Fout bij het verkrijgen van het access token:', data);
                alert('Er is een fout opgetreden bij het verkrijgen van het access token.');
            }
        })
        .catch(error => {
            console.error('Fout bij de token aanvraag:', error);
            alert('Er is een fout opgetreden bij de aanvraag van het access token.');
        });
    } else {
        console.error('Geen authorization code gevonden in de URL');
        alert('Er is geen authorization code gevonden. Probeer opnieuw in te loggen.');
    }
};
