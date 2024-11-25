// /pages/api/spotify-playlists.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching Spotify playlists:", error.message);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
}
