import { type ModelCtor } from 'sequelize'
import { type AddAccountData, type Account } from '../../../../domain/entities/account';
import { type AccountRepository } from '../../../../domain/ports/account-repository'

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
}
