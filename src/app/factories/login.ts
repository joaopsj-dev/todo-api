import { Authenticate } from '../../domain/usecases/authenticate/authenticate'
import { BcryptEncrypterAdapter } from '../../infra/adapters/encrypter/bcrypt-encrypter-adapter'
import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../infra/adapters/token/jwt-token-adapter'
import { ZodValidatorAdapter } from '../../infra/adapters/validator/zod-validator-adapter'
import { LoginController } from '../../presentation/controllers/login/login'
import { accountSchema } from '../zod/schemas/account-schema'
import AccountModel from '../db/sequelize/models/Account'

export const makeLoginController = (): LoginController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const encrypter = new BcryptEncrypterAdapter(12)
  const authenticate = new Authenticate(accountRepository, encrypter)
  //
  const loginSchema = accountSchema.pick({ email: true, password: true })
  const validator = new ZodValidatorAdapter(loginSchema)
  //
  const secretKey = process.env.JWT_SECRET_KEY
  const token = new JwtTokenAdapter(secretKey)

  return new LoginController(authenticate, validator, token)
}
