import { type AccountRepository, type TaskRepository } from './remove-account-protocols'

export class RemoveAccount {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async remove (accountId: string): Promise<boolean> {
    if (!(await this.accountRepository.findById(accountId))) return null

    await this.accountRepository.delete(accountId)
    await this.taskRepository.deleteAllFromAccount(accountId)
    return true
  }
}
