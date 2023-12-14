import { type AddAccountData, type Account, type AccountRepository, type Encrypter } from './add-account-protocols'
import { randomUUID } from 'crypto'

export class AddAccount {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly encrypter: Encrypter
  ) {}

  async add (accountData: AddAccountData): Promise<Account> {
    const accountByEmail = await this.accountRepository.findByEmail(accountData.email)
    if (accountByEmail) {
      return null
    }

    const hashedPassword = await this.encrypter.encrypt(accountData.password)
    const account = await this.accountRepository.create({
      id: randomUUID(),
      ...accountData,
      password: hashedPassword
    })

    return account
  }
}
