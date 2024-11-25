import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Playlists = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [googlePlaylists, setGooglePlaylists] = useState<any[]>([]);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Retrieve Spotify access token from URL (after successful Spotify OAuth)
    const spotifyToken = new URLSearchParams(window.location.search).get('spotify_token');
    if (spotifyToken) {
      console.log('Spotify Token:', spotifyToken);
      setSpotifyToken(spotifyToken);
      fetchSpotifyPlaylists(spotifyToken);
    } else {
      const storedSpotifyToken = localStorage.getItem('spotify_token');
      if (storedSpotifyToken) {
        setSpotifyToken(storedSpotifyToken);
        fetchSpotifyPlaylists(storedSpotifyToken);
      }
    }

    // Retrieve Google access token from URL (after successful Google OAuth)
    const googleToken = new URLSearchParams(window.location.search).get('google_token');
    if (googleToken) {
      setGoogleToken(googleToken);
      fetchGooglePlaylists(googleToken);
    } else {
      promptGoogleLogin();
    }
  }, []);

  useEffect(() => {
    if (spotifyToken) {
      localStorage.setItem('spotify_token', spotifyToken);
    }
  }, [spotifyToken]);

  const promptGoogleLogin = () => {
    window.location.href = '/api/google-auth';
  };

  const fetchSpotifyPlaylists = async (token: string) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpotifyPlaylists(response.data.items);
    } catch (error) {
      console.error('Error fetching Spotify playlists:', error.response ? error.response.data : error.message);
    }
  };

  const fetchGooglePlaylists = async (token: string) => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        headers: { Authorization: `Bearer ${token}` },
        params: { part: 'snippet', mine: true },
      });
      setGooglePlaylists(response.data.items);
    } catch (error: any) {
      console.error('Error fetching Google playlists:', error.response ? error.response.data : error.message);
    }
  };

  const createYouTubePlaylist = async (token: string, title: string) => {
    try {
      setLoading(true);
  
      const response = await axios.post(
        'https://www.googleapis.com/youtube/v3/playlists',
        {
          snippet: {
            title: title,
            description: 'Playlist created from Spotify',
          },
          status: {
            privacyStatus: 'public', // or 'private', depending on your needs
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            part: 'snippet,status', // Include the correct parts for playlist creation
          },
        }
      );
  
      console.log('Created Playlist:', response.data);
      alert(`Playlist Created: ${response.data.snippet.title}`);
      setLoading(false);
    } catch (error: any) {
      console.error('Error creating YouTube playlist:', error.response ? error.response.data : error.message);
      setLoading(false);
    }
  };
  

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getPlaylistVideos = async (youtubePlaylistId: string) => {
    try {
      // Fetch all videos in the YouTube playlist
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
        params: {
          part: 'snippet',
          playlistId: youtubePlaylistId,
          maxResults: 50, // Adjust this if you have more than 50 items
        },
      });
  
      // Extract video IDs from the playlist
      const videoIds = response.data.items.map((item: any) => item.snippet.resourceId.videoId);
      return videoIds;
    } catch (error: any) {
      console.error('Error fetching playlist videos:', error.response ? error.response.data : error.message);
      return [];
    }
  };
  
  const transferSpotifyToYouTube = async (spotifyPlaylistId: string, youtubePlaylistId: string) => {
    try {
      // Fetch tracks from the selected Spotify playlist
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      });
  
      // Get existing video IDs in the YouTube playlist
      const existingVideos = await getPlaylistVideos(youtubePlaylistId);
  
      // For each track, search YouTube for the corresponding video
      for (const track of response.data.items) {
        const videoTitle = track.track.name + ' ' + track.track.artists.map((artist: any) => artist.name).join(' ');
  
        // Search YouTube for the video
        const youtubeSearchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
          params: {
            part: 'snippet',
            q: videoTitle,
            type: 'video',
            maxResults: 1,
          },
        });
  
        const videoId = youtubeSearchResponse.data.items[0]?.id?.videoId;
  
        if (videoId && !existingVideos.includes(videoId)) {
          try {
            // Add the video to the specified YouTube playlist
            const addToPlaylistResponse = await axios.post(
              'https://www.googleapis.com/youtube/v3/playlistItems',
              {
                snippet: {
                  playlistId: youtubePlaylistId,
                  resourceId: {
                    kind: 'youtube#video',
                    videoId,
                  },
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${googleToken}`,
                },
                params: {
                  part: 'snippet',
                },
              }
            );
            console.log('Added video:', addToPlaylistResponse.data);
  
            // Delay between adding tracks to avoid quota limits
            await delay(1000);  // Delay for 1 second (adjust based on your quota usage)
  
          } catch (error: any) {
            if (error.response?.data?.error?.reason === 'quotaExceeded') {
              console.error('Quota exceeded. Please try again later.');
              return; // Stop further processing
            }
            console.error(`Error adding track to YouTube: ${videoTitle}`, error.response ? error.response.data : error.message);
          }
        } else {
          console.log(`Skipped duplicate video: ${videoTitle}`);
        }
      }
  
      alert('Playlist transfer complete!');
    } catch (error) {
      console.error('Error transferring playlist:', error.response ? error.response.data : error.message);
    }
  };
  
  
  
  

  return (
    <div>
      <h1>Your Spotify Playlists</h1>
      {spotifyPlaylists.length > 0 ? (
        <ul>
          {spotifyPlaylists.map((playlist) => (
            <li key={playlist.id}>
              <h3>{playlist.name}</h3>
              <button onClick={() => createYouTubePlaylist(googleToken!, playlist.name)}>
                Create YouTube Playlist
              </button>
              <button onClick={() => transferSpotifyToYouTube(playlist.id, googlePlaylists[0]?.id)}>
                Transfer to YouTube
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No Spotify playlists found.</p>
      )}

      <h1>Your YouTube Playlists</h1>
      {googlePlaylists.length > 0 ? (
        <ul>
          {googlePlaylists.map((playlist) => (
            <li key={playlist.id}>
              <h3>{playlist.snippet.title}</h3>
              <button onClick={() => transferSpotifyToYouTube(spotifyPlaylists[0]?.id, playlist.id)}>
                Transfer to YouTube
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No YouTube playlists found.</p>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Playlists;
