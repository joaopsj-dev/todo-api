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
}
