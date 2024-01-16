import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../infra/adapters/token/jwt-token-adapter'
import AccountModel from '../../infra/db/sequelize/models/Account'
import { RefreshTokenController } from '../../presentation/controllers/auth/refresh-token/refresh-token'
import { RefreshToken } from '../../domain/usecases/auth/refresh-token/refresh-token'
import { ZodValidatorAdapter } from '../../infra/adapters/validator/zod-validator-adapter'
import { refreshTokenSchema } from '../zod/schemas/refresh-token-schema'

export const makeRefreshTokenController = (): RefreshTokenController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const token = new JwtTokenAdapter()
  const refreshToken = new RefreshToken(accountRepository, token)
  //
  const validator = new ZodValidatorAdapter(refreshTokenSchema)
  //
  return new RefreshTokenController(refreshToken, validator)
}
