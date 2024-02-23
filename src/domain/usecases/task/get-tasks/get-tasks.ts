/* eslint-disable @typescript-eslint/no-misused-promises */
import { formatObjectDate } from '../../../helpers/format-objectDate'
import { type AccountRepository, type Task, type TaskRepository } from './get-tasks-protocols'

export class GetTasksFromAccount {
  constructor (
    private readonly taskRepository: TaskRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async get (accountId: string): Promise<Task[]> {
    if (!(await this.accountRepository.findById(accountId))) return null

    const tasks = await this.taskRepository.findAllByAccount(accountId)

    return Promise.all(tasks.map(async task => {
      const isDelayed = (task.endDate && new Date() > formatObjectDate(task.endDate)) && (task.status !== 'concluded' && task.status !== 'delayed')
      if (isDelayed) {
        task = await this.taskRepository.update({ status: 'delayed' }, task.id);
      }
      return task
    }))
  }
}
