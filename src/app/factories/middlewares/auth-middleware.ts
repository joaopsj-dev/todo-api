import { JwtTokenAdapter } from '../../../infra/adapters/token/jwt-token-adapter'
import { AuthMiddleware } from '../../../presentation/middlewares/auth/auth-middleware'
import { type Middleware } from '../../../presentation/protocols'

export const makeAuthMiddleware = (): Middleware => {
  const token = new JwtTokenAdapter()
  return new AuthMiddleware(token)
}
