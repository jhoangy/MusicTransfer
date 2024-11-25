// utils/spotify.ts
export function getSpotifyAuthUrl() {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;
  
    console.log('Spotify Client ID:', clientId);  // Check the value in the console
    console.log('Redirect URI:', redirectUri);   // Check the value in the console
  
    const scope = 'playlist-read-private playlist-modify-public playlist-modify-private';
    const responseType = 'code';
  
    return `${'https://accounts.spotify.com/authorize'}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}`;
  }
  