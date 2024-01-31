import { SequelizeTaskRepositoryAdapter } from '../../infra/adapters/repositories/task/sequelize-task-repository'
import TaskModel from '../../infra/db/sequelize/models/Task'
import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import AccountModel from '../../infra/db/sequelize/models/Account'
import { NodeMailerEmailAdapter } from '../../infra/adapters/email/nodemailer-email-adapter'
import { NotifyTask } from '../../domain/usecases/task/notify-task/notify-task'

export const makeNotifyTask = (): NotifyTask => {
  const taskRepository = new SequelizeTaskRepositoryAdapter(TaskModel)
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const emailProvider = new NodeMailerEmailAdapter()
  //
  return new NotifyTask(taskRepository, accountRepository, emailProvider)
}
