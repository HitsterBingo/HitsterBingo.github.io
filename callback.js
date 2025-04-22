window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        console.log("Code ontvangen. Access token aanvragen...");

        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'https://transcendent-cranachan-74e40a.netlify.app/callback/',
                client_id: '2c5922b245944d7087cacfc63872f736',
                code_verifier: localStorage.getItem('code_verifier')
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.access_token) {
                localStorage.setItem('spotify_access_token', data.access_token);
                window.location.href = '/game.html';
            } else {
                alert("Token ophalen mislukt.");
                console.error(data);
            }
        })
        .catch(err => {
            alert("Fout bij ophalen van token.");
            console.error(err);
        });
    } else {
        console.error('Geen code ontvangen.');
    }
};
