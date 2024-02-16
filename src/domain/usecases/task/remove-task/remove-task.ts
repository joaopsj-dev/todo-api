import { type TaskRepository, type AccountRepository } from './remove-task-protocols'
import { type Either, failure, success } from '../../../protocols/either'

export interface RemoveTaskError {
  message: string
  type: 'TaskNotFound' | 'InvalidAccount'
}

export class RemoveTask {
  constructor (
    private readonly taskRepository: TaskRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async remove (taskId: string, accountId: string): Promise<Either<RemoveTaskError, { message: string }>> {
    const taskById = await this.taskRepository.findById(taskId)
    if (!taskById) return failure({ message: 'task not found', type: 'TaskNotFound' })

    const accountById = await this.accountRepository.findById(accountId)

    if (taskById.accountId !== accountById?.id) return failure({ message: 'you can only remove a task that belongs to you', type: 'InvalidAccount' })

    await this.taskRepository.delete(taskId)
    return success({ message: 'task successfully removed' })
  }
}
