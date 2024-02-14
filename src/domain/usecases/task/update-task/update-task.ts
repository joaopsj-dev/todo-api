import { type AddTaskData, type Task, type TaskRepository } from './update-task-protocols'
import { failure, type Either, success } from '../../../protocols/either'
import { formatObjectDate } from '../../../helpers/format-objectDate'

export interface UpdateTaskError {
  message: string
  type: 'TaskNotFound' | 'InvalidDateRange'
}

export type UpdateTaskData = Omit<Partial<AddTaskData>, 'accountId'> & { status?: Task['status'] }

export class UpdateTask {
  constructor (
    private readonly taskRepository: TaskRepository
  ) {}

  async update (taskData: UpdateTaskData, taskId: string): Promise<Either<UpdateTaskError, Task>> {
    const taskById = await this.taskRepository.findById(taskId)
    if (!taskById) return failure({ message: 'task not found', type: 'TaskNotFound' })

    const endDate = taskData.endDate ? formatObjectDate(taskData.endDate) : null
    if (endDate && endDate < new Date()) return failure({ message: 'The end date cannot be earlier than the current date', type: 'InvalidDateRange' })

    if (taskData.isNotify) {
      const notifyDate = taskData.notifyDate ? formatObjectDate(taskData.notifyDate) : null

      if (!notifyDate) return failure({ message: 'To be notified you must provide a notify date', type: 'InvalidDateRange' })
      if (notifyDate > endDate) return failure({ message: 'The notification date cannot be later than the end date', type: 'InvalidDateRange' })
    }

    const task = await this.taskRepository.update({
      name: taskData?.name || taskById.name,
      description: taskData?.description || taskById.description,
      notifyDate: taskData?.notifyDate || taskById.notifyDate,
      endDate: taskData?.endDate || taskById.endDate,
      isNotify: taskData?.isNotify || taskById.isNotify,
      status: taskData?.status || taskById.status
    }, taskId)

    return success(task)
  }
}
