import { type AccountRepository } from './remove-account-protocols'

export class RemoveAccount {
  constructor (
    private readonly accountRepository: AccountRepository
  ) {}

  async remove (accountId: string): Promise<boolean> {
    if (!(await this.accountRepository.findById(accountId))) return null

    await this.accountRepository.delete(accountId)
    return true
  }
}
