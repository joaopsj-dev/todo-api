import { AddAccount } from '../../domain/usecases/add-account/add-account'
import { BcryptEncrypterAdapter } from '../../infra/adapters/encrypter/bcrypt-encrypter-adapter'
import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../infra/adapters/token/jwt-token-adapter'
import { ZodValidatorAdapter } from '../../infra/adapters/validator/zod-validator-adapter'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { accountSchema } from '../zod/schemas/account-schema'
import AccountModel from '../../infra/db/sequelize/models/Account'

export const makeSignUpController = (): SignUpController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const encrypter = new BcryptEncrypterAdapter(12)
  const addAccount = new AddAccount(accountRepository, encrypter)
  //
  const validator = new ZodValidatorAdapter(accountSchema)
  //
  const secretKey = process.env.JWT_SECRET_KEY
  const token = new JwtTokenAdapter(secretKey)

  return new SignUpController(addAccount, validator, token)
}
