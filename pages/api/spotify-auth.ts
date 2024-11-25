import { NextApiRequest, NextApiResponse } from 'next';
import queryString from 'query-string';

const clientId = process.env.SPOTIFY_CLIENT_ID!;
const redirectUri = `${process.env.NEXTAUTH_URL}/api/spotify-callback`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUrl = queryString.stringifyUrl({
    url: 'https://accounts.spotify.com/authorize',
    query: {
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'playlist-read-private',
    },
  });
  res.redirect(authUrl);
}
