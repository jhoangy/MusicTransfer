// /pages/api/spotify-callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  if (!code) {
    console.error("Authorization code missing in callback");
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const token = response.data.access_token;

    if (!token) {
      console.error("Failed to retrieve access token");
      return res.status(500).json({ error: 'Failed to retrieve access token' });
    }

    // Redirect to /playlists page with the token in the URL
    res.redirect(`/playlists?spotify_token=${token}`);
  } catch (error) {
    console.error("Error in Spotify callback:", error);
    return res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
}
