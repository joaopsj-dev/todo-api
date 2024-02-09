import { AddAccount } from '../../domain/usecases/auth/add-account/add-account'
import { BcryptEncrypterAdapter } from '../../infra/adapters/encrypter/bcrypt-encrypter-adapter'
import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../infra/adapters/token/jwt-token-adapter'
import { ZodValidatorAdapter } from '../../infra/adapters/validator/zod-validator-adapter'
import { SignUpController } from '../../presentation/controllers/auth/signup/signup'
import { accountSchema } from '../zod/schemas/account-schema'
import AccountModel from '../../infra/db/sequelize/models/Account'
import encrypter_protocols from '../../domain/protocols/encrypter'

export const makeSignUpController = (): SignUpController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const encrypter = new BcryptEncrypterAdapter(encrypter_protocols.salt)
  const token = new JwtTokenAdapter()
  const addAccount = new AddAccount(accountRepository, encrypter, token)
  //
  const validator = new ZodValidatorAdapter(accountSchema)
  //
  return new SignUpController(addAccount, validator)
}
