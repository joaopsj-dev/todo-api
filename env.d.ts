declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      NODE_ENV: string
      ACCESS_TOKEN_SECRET_KEY: string
      REFRESH_TOKEN_SECRET_KEY: string
    }
  }
}
export {}
