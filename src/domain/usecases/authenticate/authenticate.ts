import { type Encrypter, type Account, type AccountRepository } from './authenticate-protocols'
import { failure, type Either, success } from '../../protocols/either'

export interface AuthenticateError {
  message: 'user not found' | 'incorrect password'
}

export class Authenticate {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly encrypter: Encrypter
  ) {}

  async auth ({ email, password }: { email: string, password: string }): Promise<Either<AuthenticateError, Account>> {
    const accountByEmail = await this.accountRepository.findByEmail(email)
    if (!accountByEmail) {
      return failure({ message: 'user not found' })
    }

    const hashedPassword = await this.encrypter.encrypt(password)

    if (accountByEmail.password !== hashedPassword) {
      return failure({ message: 'incorrect password' })
    }

    return success(accountByEmail)
  }
}
