declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      NODE_ENV: string
      JWT_SECRET_KEY: string
    }
  }
}
export {}
