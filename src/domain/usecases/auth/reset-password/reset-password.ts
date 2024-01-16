import { type Encrypter, type Account, type AccountRepository } from './reset-password-protocols'

interface ResetPasswordData {
  password: string
  accountId: string
}

export class ResetPassword {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly encrypter: Encrypter
  ) {}

  async reset ({ password, accountId }: ResetPasswordData): Promise<Account> {
    if (!(await this.accountRepository.findById(accountId))) return null

    const hashedPassword = await this.encrypter.encrypt(password)

    return await this.accountRepository.update({ password: hashedPassword }, accountId)
  }
}
