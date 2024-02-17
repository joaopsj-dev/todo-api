import { type Task } from '../entities/task'

export interface TaskRepository {
  create: (taskData: Task) => Promise<Task>
  findByIsNotify: () => Promise<Task[]>
  update: (taskData: Partial<Task>, taskId: string) => Promise<Task>
  findById: (taskId: string) => Promise<Task>
  delete: (taskId: string) => Promise<void>
  findAllByAccount: (accountId: string) => Promise<Task[]>
}
