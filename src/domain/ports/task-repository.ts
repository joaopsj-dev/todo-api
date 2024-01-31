import { type Task } from '../entities/task'

export interface TaskRepository {
  create: (taskData: Task) => Promise<Task>
  findByIsNotify: () => Promise<Task[]>
  update: (taskData: Partial<Task>, taskId: string) => Promise<Task>
}
