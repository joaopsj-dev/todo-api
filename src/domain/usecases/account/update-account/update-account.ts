import { type AddAccountData, type Account, type AccountRepository, type Encrypter } from './update-account-protocols'
import { failure, type Either, success } from '../../../protocols/either'

export interface UpdateAccountError {
  message: 'account not found' | 'email already exists'
}

export class UpdateAccount {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly encrypter: Encrypter
  ) {}

  async update (accountData: Partial<AddAccountData>, accountId: string): Promise<Either<UpdateAccountError, Account>> {
    const accountById = await this.accountRepository.findById(accountId)
    if (!accountById) return failure({ message: 'account not found' })

    let email = accountById.email
    if (accountData.email) {
      const accountByEmail = await this.accountRepository.findByEmail(accountData.email)
      if (accountByEmail && accountByEmail.id !== accountById.id) return failure({ message: 'email already exists' })
      email = accountData.email
    }

    const hashedPassword = accountData.password ? await this.encrypter.encrypt(accountData.password) : accountById.password

    const updatedAccount = await this.accountRepository.update({
      name: accountData?.name || accountById.name,
      email,
      password: hashedPassword
    }, accountId)

    return success(updatedAccount)
  }
}
