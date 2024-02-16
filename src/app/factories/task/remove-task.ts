import TaskModel from '../../../infra/db/sequelize/models/Task'
import { ZodValidatorAdapter } from '../../../infra/adapters/validator/zod-validator-adapter'
import { RemoveTaskController } from '../../../presentation/controllers/task/remove-task/remove-task'
import { SequelizeTaskRepositoryAdapter } from '../../../infra/adapters/repositories/task/sequelize-task-repository'
import { RemoveTask } from '../../../domain/usecases/task/remove-task/remove-task'
import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import AccountModel from '../../../infra/db/sequelize/models/Account'
import { taskIdSchema } from '../../zod/schemas/taskId-schema'
import { accountIdSchema } from '../../zod/schemas/accountId-schema'

export const makeRemoveTaskController = (): RemoveTaskController => {
  const taskRepository = new SequelizeTaskRepositoryAdapter(TaskModel)
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const removeTask = new RemoveTask(taskRepository, accountRepository)
  //
  const validator = new ZodValidatorAdapter(taskIdSchema.merge(accountIdSchema))
  //
  return new RemoveTaskController(removeTask, validator)
}
