declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      NODE_ENV: string
      ACCESS_TOKEN_SECRET_KEY: string
      REFRESH_TOKEN_SECRET_KEY: string
      RECOVER_TOKEN_SECRET_KEY: string
      MAIL_HOST: string
      MAIL_PORT: string
      MAIL_USER: string
      MAIL_PASSWORD: string
      MAIL_FROM: string
    }
  }
}
export {}
