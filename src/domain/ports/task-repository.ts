import { type Task } from '../entities/task'

export interface TaskRepository {
  create: (accountData: Task) => Promise<Task>
}
