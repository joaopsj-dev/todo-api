/* eslint-disable @typescript-eslint/no-misused-promises */
import { type AddTaskData, type Task, type AccountRepository, type TaskRepository } from './create-task-protocols'
import { failure, type Either, success } from '../../../protocols/either'
import { randomUUID } from 'crypto'
import { formatObjectDate } from '../../../helpers/format-objectDate'

export interface CreateTaskError {
  message: string
  type: 'AccountNotFound' | 'InvalidDateRange'
}

export class CreateTask {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async create (taskData: AddTaskData): Promise<Either<CreateTaskError, Task>> {
    const accountToNotify = await this.accountRepository.findById(taskData.accountId)
    if (!accountToNotify) return failure({ message: 'Account by id not found', type: 'AccountNotFound' })

    const endDate = taskData.endDate ? formatObjectDate(taskData.endDate) : null
    if (endDate && endDate < new Date()) return failure({ message: 'The end date cannot be earlier than the current date', type: 'InvalidDateRange' })

    if (taskData.isNotify) {
      const notifyDate = taskData.notifyDate ? formatObjectDate(taskData.notifyDate) : null

      if (!notifyDate) return failure({ message: 'To be notified you must provide a notify date', type: 'InvalidDateRange' })
      if (notifyDate > endDate) return failure({ message: 'The notification date cannot be later than the end date', type: 'InvalidDateRange' })
    }

    const task = await this.taskRepository.create({
      id: randomUUID(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    })

    return success(task)
  }
}
