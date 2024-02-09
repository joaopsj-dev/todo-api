import { UpdateAccount } from '../../../domain/usecases/account/update-account/update-account'
import { BcryptEncrypterAdapter } from '../../../infra/adapters/encrypter/bcrypt-encrypter-adapter'
import { updateAccountSchema } from '../../zod/schemas/update-account-schema'
import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import { ZodValidatorAdapter } from '../../../infra/adapters/validator/zod-validator-adapter'
import { UpdateAccountController } from '../../../presentation/controllers/account/update-account/update-account'
import AccountModel from '../../../infra/db/sequelize/models/Account'
import encrypter_protocols from '../../../domain/protocols/encrypter'

export const makeUpdateAccountController = (): UpdateAccountController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const encrypter = new BcryptEncrypterAdapter(encrypter_protocols.salt)
  const updateAccount = new UpdateAccount(accountRepository, encrypter)
  //
  const validator = new ZodValidatorAdapter(updateAccountSchema)
  //

  return new UpdateAccountController(updateAccount, validator)
}
