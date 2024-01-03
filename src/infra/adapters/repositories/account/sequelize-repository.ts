import { type ModelCtor } from 'sequelize'
import { type Account } from '../../../../domain/entities/account';
import { type AccountRepository } from '../../../../domain/ports/account-repository'

export class SequelizeAccountRepositoryAdapter implements AccountRepository {
  constructor (
    private readonly AccountModel: ModelCtor<any>
  ) {}

  async create (accountData: Account): Promise<Account> {
    return await this.AccountModel.create({ ...accountData })
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

  async update (accountData: Account, accountId: string): Promise<Account> {
    await this.AccountModel.update({ ...accountData }, {
      where: { id: accountId }
    })

    return this.findById(accountId)
  }
}
