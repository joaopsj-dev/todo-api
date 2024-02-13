import { type AccountDto, type AccountRepository } from './get-account-protocols'

export class GetAccount {
  constructor (
    private readonly accountRepository: AccountRepository
  ) {}

  async get (accountId: string): Promise<AccountDto> {
    const accountById = await this.accountRepository.findById(accountId)

    return accountById
      ? {
          name: accountById.name,
          email: accountById.email,
          createdAt: accountById.createdAt,
          updatedAt: accountById.updatedAt
        }
      : null
  }
}
