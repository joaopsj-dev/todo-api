import { type Encrypter, type Account, type AccountRepository, type Token } from './authenticate-protocols'
import { failure, type Either, success } from '../../protocols/either'
import token from '../../protocols/token'

export interface AuthenticateError {
  message: 'user not found' | 'incorrect password'
}

export class Authenticate {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly encrypter: Encrypter,
    private readonly token: Token
  ) {}

  async auth ({ email, password }: { email: string, password: string }): Promise<Either<AuthenticateError, Account>> {
    const accountByEmail = await this.accountRepository.findByEmail(email)
    if (!accountByEmail) {
      return failure({ message: 'user not found' })
    }

    const resultParsed = await this.encrypter.parse(password, accountByEmail.password)

    if (!resultParsed) {
      return failure({ message: 'incorrect password' })
    }

    const refreshToken = await this.token.generate({ id: accountByEmail.id }, {
      expiresIn: token.refresh_token_expires_in,
      secretKey: token.refreshToken_secret_key
    })

    const account = await this.accountRepository.update({
      refreshToken
    }, accountByEmail.id)

    return success(account)
  }
}
