import { type Account } from '../entities/account'

export interface AccountRepository {
  findByEmail: (email: string) => Promise<Account>
  create: (accountData: Account) => Promise<Account>
}
