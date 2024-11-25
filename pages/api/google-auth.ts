import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default function handler(req, res) {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.force-ssl', // YouTube permission
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',  // To get refresh tokens
    scope: scopes,
  });

  res.redirect(url); // Redirect user to Google's OAuth consent page
}
