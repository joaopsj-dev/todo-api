import { type ModelCtor } from 'sequelize'
import { type Task } from '../../../../domain/entities/task';
import { type TaskRepository } from '../../../../domain/ports/task-repository'

export class SequelizeTaskRepositoryAdapter implements TaskRepository {
  constructor (
    private readonly TaskModel: ModelCtor<any>
  ) {}

  async create (taskData: Task): Promise<Task> {
    return await this.TaskModel.create({ ...taskData })
  }
}
