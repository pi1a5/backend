module.exports = function getGoogleOauthTokens(code) {
    const url = 'http://oauth2.googleapis.com/token';

    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_url: process.env.GOOGLE_REDIRECT_URL,
        grant_type: 'authorization_code'
    }
  };