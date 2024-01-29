import { type Task } from '../entities/task'

export interface TaskRepository {
  create: (taskData: Task) => Promise<Task>
  findByIsNotify: () => Promise<Task[]>
}
