import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import { ZodValidatorAdapter } from '../../../infra/adapters/validator/zod-validator-adapter'
import { GetAccountController } from '../../../presentation/controllers/account/get-account/get-account'
import AccountModel from '../../../infra/db/sequelize/models/Account'
import { accountIdSchema } from '../../zod/schemas/accountId-schema'
import { GetAccount } from '../../../domain/usecases/account/get-account/get-account'

export const makeGetAccountController = (): GetAccountController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const getAccount = new GetAccount(accountRepository)
  //
  const validator = new ZodValidatorAdapter(accountIdSchema)
  //
  return new GetAccountController(getAccount, validator)
}
