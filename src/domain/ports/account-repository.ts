import { type Account } from '../entities/account'

export interface AccountRepository {
  findById: (id: string) => Promise<Account>
  findByEmail: (email: string) => Promise<Account>
  create: (accountData: Account) => Promise<Account>
  update: (accountData: Account, accountId: string) => Promise<Account>
}
