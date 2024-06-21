import { type Account } from '../entities/account'
import { type Transaction } from './transaction'

export type UpdateAccountData = Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt' >>

export interface AccountRepository {
  findById: (id: string) => Promise<Account>
  findByEmail: (email: string) => Promise<Account>
  create: (accountData: Omit<Account, 'createdAt' | 'updatedAt'>) => Promise<Account>
  update: (accountData: UpdateAccountData, accountId: string) => Promise<Account>
  delete: (accountId: string, transaction?: Transaction) => Promise<void>
}
