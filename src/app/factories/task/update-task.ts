import TaskModel from '../../../infra/db/sequelize/models/Task'
import { ZodValidatorAdapter } from '../../../infra/adapters/validator/zod-validator-adapter'
import { UpdateTaskController } from '../../../presentation/controllers/task/update-task/update-task'
import { SequelizeTaskRepositoryAdapter } from '../../../infra/adapters/repositories/task/sequelize-task-repository'
import { UpdateTask } from '../../../domain/usecases/task/update-task/update-task'
import { updateTaskSchema } from '../../zod/schemas/update-task-schema'

export const makeUpdateTaskController = (): UpdateTaskController => {
  const taskRepository = new SequelizeTaskRepositoryAdapter(TaskModel)
  const updateTask = new UpdateTask(taskRepository)
  //
  const validator = new ZodValidatorAdapter(updateTaskSchema)
  //
  return new UpdateTaskController(updateTask, validator)
}
