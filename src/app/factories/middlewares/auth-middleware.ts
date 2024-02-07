import { type Middleware } from '../../../presentation/protocols'
import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../../infra/adapters/token/jwt-token-adapter'
import AccountModel from '../../../infra/db/sequelize/models/Account'
import { AuthMiddleware } from '../../../presentation/middlewares/auth/auth-middleware'
import { ValidateAccess } from '../../../presentation/middlewares/auth/auth-middleware-protocols'

export const makeAuthMiddleware = (): Middleware => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const token = new JwtTokenAdapter()
  const validateAccess = new ValidateAccess(accountRepository, token)
  return new AuthMiddleware(validateAccess)
}
