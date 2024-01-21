/* eslint-disable @typescript-eslint/no-misused-promises */
import { type AddTaskData, type Task, type AccountRepository, type Scheduler, type EmailProvider, type TaskRepository } from './create-task-protocols'
import { failure, type Either, success } from '../../../protocols/either'
import { randomUUID } from 'crypto'

export interface CreateTaskError {
  message: string
  type: 'AccountNotFound' | 'InvalidDateRange' | 'RequiredData'
}

export class CreateTask {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly taskRepository: TaskRepository,
    private readonly scheduler: Scheduler,
    private readonly emailProvider: EmailProvider
  ) {}

  async create (taskData: AddTaskData): Promise<Either<CreateTaskError, Task>> {
    const accountToNotify = await this.accountRepository.findById(taskData.accountId)
    if (!accountToNotify) return failure({ message: 'Account by id not found', type: 'AccountNotFound' })

    if (taskData.endDate && taskData.endDate < new Date()) return failure({ message: 'The end date cannot be earlier than the current date', type: 'InvalidDateRange' })

    let notification

    if (taskData.isNotify) {
      if (!taskData.notifyDate) return failure({ message: 'To be notified you must provide a notify date', type: 'InvalidDateRange' })
      if (taskData.notifyDate > taskData.endDate) return failure({ message: 'The notification date cannot be later than the end date', type: 'InvalidDateRange' })

      const date = new Date(
        taskData.notifyDate.getFullYear(),
        taskData.notifyDate.getMonth(),
        taskData.notifyDate.getDate(),
        taskData.notifyDate.getHours(),
        taskData.notifyDate.getMinutes(),
        taskData.notifyDate.getSeconds(),
        taskData.notifyDate.getMilliseconds()
      );

      notification = this.scheduler.create(date, async () => {
        await this.emailProvider.send({
          to: accountToNotify.email,
          subject: `It's time to do your task: ${taskData.name}`
        })
      })
    }

    const task = await this.taskRepository.create({
      id: randomUUID(),
      notification,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    })

    return success(task)
  }
}
