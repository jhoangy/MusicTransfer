import { getSpotifyAuthUrl } from '../utils/spotify';

const Home = () => {
  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl(); // Redirect user to Spotify login
  };

  return (
    <div>
      <h1>Welcome to Spotify to YouTube Music!</h1>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
};

export default Home;
