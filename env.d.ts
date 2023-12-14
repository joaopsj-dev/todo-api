declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      RUNING_IN: string
      JWT_SECRET_KEY: string
    }
  }
}
export {}
