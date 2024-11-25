// api/google-callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { code } = req.query;  // Retrieve the authorization code from the query string
    if (!code) {
      return res.status(400).send('Authorization code is missing');
    }

    try {
      // Exchange the code for tokens
      const { tokens } = await googleOAuth2Client.getToken(code as string);
      googleOAuth2Client.setCredentials(tokens);

      // Store the token in the URL to pass it back to the client (e.g., Playlists.tsx)
      res.redirect(`/playlists?google_token=${tokens.access_token}`);
    } catch (error) {
      console.error('Error during token exchange:', error);
      res.status(500).send('Error during Google OAuth callback');
    }
  }
}
