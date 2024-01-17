import { type AddAccountData, type Account } from '../entities/account'

export interface AccountRepository {
  findById: (id: string) => Promise<Account>
  findByEmail: (email: string) => Promise<Account>
  create: (accountData: Omit<Account, 'createdAt' | 'updatedAt'>) => Promise<Account>
  update: (accountData: Partial<AddAccountData>, accountId: string) => Promise<Account>
}
