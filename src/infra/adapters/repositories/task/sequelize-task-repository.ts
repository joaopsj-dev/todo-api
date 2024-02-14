import { Op, type ModelCtor } from 'sequelize'
import { type Task } from '../../../../domain/entities/task';
import { type TaskRepository } from '../../../../domain/ports/task-repository'

export class SequelizeTaskRepositoryAdapter implements TaskRepository {
  constructor (
    private readonly TaskModel: ModelCtor<any>
  ) {}

  async findById (taskId: string): Promise<Task> {
    return await this.TaskModel.findOne({
      where: { id: taskId }
    })
  }

  async create (taskData: Task): Promise<Task> {
    return await this.TaskModel.create({ ...taskData })
  }

  async findByIsNotify (): Promise<Task[]> {
    const currentDate = new Date()

    return this.TaskModel.findAll({
      where: {
        isNotify: true,
        notifyDate: {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate(),
          hour: currentDate.getHours(),
          minute: {
            [Op.between]: [currentDate.getMinutes() - 2, currentDate.getMinutes() + 2]
          }
        }
      }
    })
  }

  async update (taskData: Partial<Task>, taskId: string): Promise<Task> {
    await this.TaskModel.update({ ...taskData }, {
      where: {
        id: taskId
      }
    })

    return this.TaskModel.findByPk(taskId)
  }
}
