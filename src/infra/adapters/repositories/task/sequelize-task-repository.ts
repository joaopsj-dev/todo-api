import { Op, type ModelCtor, type Transaction as SequelizeTransaction } from 'sequelize'
import { type Task } from '../../../../domain/entities/task';
import { type TaskRepository } from '../../../../domain/ports/task-repository'
import { type Transaction } from '../../../../domain/ports/transaction';

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
    await this.TaskModel.update({
      ...taskData,
      updatedAt: new Date()
    }, {
      where: { id: taskId }
    })

    return this.TaskModel.findByPk(taskId)
  }

  async delete (taskId: string): Promise<void> {
    await this.TaskModel.destroy({
      where: { id: taskId }
    })
  }

  async findAllByAccount (accountId: string): Promise<Task[]> {
    return await this.TaskModel.findAll({
      where: { accountId }
    })
  }

  async deleteAllFromAccount (accountId: string, transaction?: Transaction): Promise<void> {
    await this.TaskModel.destroy({
      where: { accountId },
      transaction: transaction as unknown as SequelizeTransaction
    })
  }
}
