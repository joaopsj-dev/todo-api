import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import { ZodValidatorAdapter } from '../../../infra/adapters/validator/zod-validator-adapter'
import { RemoveAccountController } from '../../../presentation/controllers/account/remove-account/remove-account'
import AccountModel from '../../../infra/db/sequelize/models/Account'
import { accountIdSchema } from '../../zod/schemas/accountId-schema'
import { RemoveAccount } from '../../../domain/usecases/account/remove-account/remove-account'

export const makeRemoveAccountController = (): RemoveAccountController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const removeAccount = new RemoveAccount(accountRepository)
  //
  const validator = new ZodValidatorAdapter(accountIdSchema)
  //
  return new RemoveAccountController(removeAccount, validator)
}
