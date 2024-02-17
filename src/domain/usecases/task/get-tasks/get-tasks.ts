import { type AccountRepository, type Task, type TaskRepository } from './get-tasks-protocols'

export class GetTasksFromAccount {
  constructor (
    private readonly taskRepository: TaskRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async get (accountId: string): Promise<Task[]> {
    if (!(await this.accountRepository.findById(accountId))) return null

    const tasks = await this.taskRepository.findAllByAccount(accountId)

    if (tasks[0]?.accountId !== accountId) return null

    return tasks
  }
}
