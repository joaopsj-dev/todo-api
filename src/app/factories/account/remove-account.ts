import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import { ZodValidatorAdapter } from '../../../infra/adapters/validator/zod-validator-adapter'
import { RemoveAccountController } from '../../../presentation/controllers/account/remove-account/remove-account'
import AccountModel from '../../../infra/db/sequelize/models/Account'
import { accountIdSchema } from '../../zod/schemas/accountId-schema'
import { RemoveAccount } from '../../../domain/usecases/account/remove-account/remove-account'
import { SequelizeTaskRepositoryAdapter } from '../../../infra/adapters/repositories/task/sequelize-task-repository'
import TaskModel from '../../../infra/db/sequelize/models/Task'
import { SequelizeTransactionObjectAdapter, SequelizeTransactionManagerAdapter } from '../../../infra/adapters/transaction/sequelize-transaction-adapter'
import { sequelize } from '../../../infra/db/sequelize/sequelize'

export const makeRemoveAccountController = (): RemoveAccountController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const taskRepository = new SequelizeTaskRepositoryAdapter(TaskModel)
  const transactionObject = new SequelizeTransactionObjectAdapter(sequelize)
  const transactionManager = new SequelizeTransactionManagerAdapter(transactionObject)
  const removeAccount = new RemoveAccount(accountRepository, taskRepository, transactionManager)
  //
  const validator = new ZodValidatorAdapter(accountIdSchema)
  //
  return new RemoveAccountController(removeAccount, validator)
}
