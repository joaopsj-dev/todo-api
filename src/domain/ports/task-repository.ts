import { type Task } from '../entities/task'
import { type Transaction } from './transaction'

export interface TaskRepository {
  create: (taskData: Task) => Promise<Task>
  findByIsNotify: () => Promise<Task[]>
  update: (taskData: Partial<Task>, taskId: string) => Promise<Task>
  findById: (taskId: string) => Promise<Task>
  delete: (taskId: string) => Promise<void>
  findAllByAccount: (accountId: string) => Promise<Task[]>
  deleteAllFromAccount: (accountId: string, transaction?: Transaction) => Promise<void>
}
