// /pages/api/transfer-playlist.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { spotifyPlaylistId, googleToken, spotifyToken } = req.body;  // Ensure spotifyToken and googleToken are passed

  if (!spotifyPlaylistId || !googleToken || !spotifyToken) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Fetch Spotify playlist data using the provided spotifyToken
    const spotifyResponse = await axios.get(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}`, {
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
      },
    });

    // Debugging: Check the playlist data
    console.log('Spotify playlist data:', spotifyResponse.data);

    const playlistTracks = spotifyResponse.data.tracks.items;

    // Create a new YouTube playlist
    const youtubeResponse = await axios.post(
      'https://www.googleapis.com/youtube/v3/playlists',
      {
        snippet: {
          title: spotifyResponse.data.name,
          description: spotifyResponse.data.description,
        },
        status: {
          privacyStatus: 'private', // Change to public if needed
        },
      },
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      }
    );

    // Debugging: Log the YouTube API response
    console.log('YouTube playlist created:', youtubeResponse.data);

    const youtubePlaylistId = youtubeResponse.data.id;

    // Add each track from the Spotify playlist to the YouTube playlist
    for (const track of playlistTracks) {
      const videoId = track.track.id; // Ensure this is a valid YouTube video ID

      const youtubeItemResponse = await axios.post(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
          snippet: {
            playlistId: youtubePlaylistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
        }
      );

      if (youtubeItemResponse.status !== 200) {
        console.error(`Failed to add track ${videoId} to YouTube playlist: ${youtubeItemResponse.status}`);
      }
    }

    res.status(200).json({ success: true, message: 'Playlist transferred to YouTube!' });
  } catch (error) {
    console.error('Error transferring playlist:', error);
    if (error.response) {
      console.error('Error Response:', error.response.data);  // Log the full error response
    }
    res.status(500).json({ error: 'Failed to transfer playlist to YouTube', message: error.message });
  }
}
