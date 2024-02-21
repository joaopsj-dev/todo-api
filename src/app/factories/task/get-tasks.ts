import TaskModel from '../../../infra/db/sequelize/models/Task'
import { GetTasksController } from '../../../presentation/controllers/task/get-tasks/get-tasks'
import { SequelizeTaskRepositoryAdapter } from '../../../infra/adapters/repositories/task/sequelize-task-repository'
import { GetTasksFromAccount } from '../../../domain/usecases/task/get-tasks/get-tasks'
import { SequelizeAccountRepositoryAdapter } from '../../../infra/adapters/repositories/account/sequelize-repository'
import AccountModel from '../../../infra/db/sequelize/models/Account'

export const makeGetTasksController = (): GetTasksController => {
  const taskRepository = new SequelizeTaskRepositoryAdapter(TaskModel)
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const getTasksFromAccount = new GetTasksFromAccount(taskRepository, accountRepository)
  //
  //
  return new GetTasksController(getTasksFromAccount)
}
