import AccountModel from '../../../infra/db/sequelize/models/Account'
import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import TaskModel from '../../../infra/db/sequelize/models/Task'
import { CreateTask } from '../../../domain/usecases/task/create-task/create-task'
import { taskSchema } from '../../zod/schemas/task-schema'
import { ZodValidatorAdapter } from '../../../infra/adapters/validator/zod-validator-adapter'
import { CreateTaskController } from '../../../presentation/controllers/task/create-task/create-task'
import { SequelizeTaskRepositoryAdapter } from '../../../infra/adapters/repositories/task/sequelize-task-repository'

export const makeCreateTaskController = (): CreateTaskController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const taskRepository = new SequelizeTaskRepositoryAdapter(TaskModel)
  const createTask = new CreateTask(accountRepository, taskRepository)
  //
  const validator = new ZodValidatorAdapter(taskSchema)
  //

  return new CreateTaskController(validator, createTask)
}
