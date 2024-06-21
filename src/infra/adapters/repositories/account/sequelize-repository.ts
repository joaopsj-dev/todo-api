import { type ModelCtor, type Transaction as SequelizeTransaction } from 'sequelize'
import { type AddAccountData, type Account } from '../../../../domain/entities/account';
import { type AccountRepository } from '../../../../domain/ports/account-repository'
import { type Transaction } from '../../../../domain/ports/transaction';

export class SequelizeAccountRepositoryAdapter implements AccountRepository {
  constructor (
    private readonly AccountModel: ModelCtor<any>
  ) {}

  async create (accountData: Omit<Account, 'createdAt' | 'updatedAt'>): Promise<Account> {
    return await this.AccountModel.create({
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  async findByEmail (email: string): Promise<Account> {
    return await this.AccountModel.findOne({
      where: { email }
    })
  }

  async findById (id: string): Promise<Account> {
    return await this.AccountModel.findOne({
      where: { id }
    })
  }

  async update (accountData: Partial<AddAccountData>, accountId: string): Promise<Account> {
    await this.AccountModel.update({
      ...accountData,
      updatedAt: new Date()
    }, {
      where: { id: accountId }
    })

    return this.findById(accountId)
  }

  async delete (accountId: string, transaction?: Transaction): Promise<void> {
    await this.AccountModel.destroy({
      where: { id: accountId },
      transaction: transaction as unknown as SequelizeTransaction
    })
  }
}
