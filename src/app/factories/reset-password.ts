import { ResetPassword } from '../../domain/usecases/reset-password/reset-password'
import { BcryptEncrypterAdapter } from '../../infra/adapters/encrypter/bcrypt-encrypter-adapter'
import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../infra/adapters/token/jwt-token-adapter'
import { ZodValidatorAdapter } from '../../infra/adapters/validator/zod-validator-adapter'
import { ResetPasswordController } from '../../presentation/controllers/reset-password/reset-password'
import { accountSchema } from '../zod/schemas/account-schema'
import AccountModel from '../../infra/db/sequelize/models/Account'

export const makeResetPasswordController = (): ResetPasswordController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const encrypter = new BcryptEncrypterAdapter(12)
  const resetPassword = new ResetPassword(accountRepository, encrypter)
  //
  const resetPasswordSchema = accountSchema.pick({ password: true })
  const validator = new ZodValidatorAdapter(resetPasswordSchema)
  const token = new JwtTokenAdapter()
  //
  return new ResetPasswordController(resetPassword, validator, token)
}
