const dotenv = require('dotenv')
dotenv.config()

export default {
  accessToken_secret_key: process.env.ACCESS_TOKEN_SECRET_KEY,
  refreshToken_secret_key: process.env.REFRESH_TOKEN_SECRET_KEY,

  access_token_expires_in: '20m',
  refresh_token_expires_in: '7d'
}
