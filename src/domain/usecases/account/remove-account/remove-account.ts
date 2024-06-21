import { type Transaction, type TransactionManager, type AccountRepository, type TaskRepository } from './remove-account-protocols'

export class RemoveAccount {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly taskRepository: TaskRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async remove (accountId: string): Promise<boolean> {
    if (!(await this.accountRepository.findById(accountId))) return null

    return await this.transactionManager.transaction<boolean>(async (transaction: Transaction) => {
      await this.accountRepository.delete(accountId, transaction)
      await this.taskRepository.deleteAllFromAccount(accountId, transaction)
      return true
    })
  }
}
