declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      JWT_SECRET_KEY: string
    }
  }
}
export {}
