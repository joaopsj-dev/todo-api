import { type AddAccountData, type Account, type AccountRepository, type Encrypter, type Token } from './add-account-protocols'
import { randomUUID } from 'crypto'
import token_protocols from '../../../../domain/protocols/token'

export class AddAccount {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly encrypter: Encrypter,
    private readonly token: Token
  ) {}

  async add (accountData: AddAccountData): Promise<Account> {
    const accountByEmail = await this.accountRepository.findByEmail(accountData.email)
    if (accountByEmail) {
      return null
    }

    const hashedPassword = await this.encrypter.encrypt(accountData.password)

    const id = randomUUID()
    const accessToken = await this.token.generate({ id }, {
      expiresIn: token_protocols.access_token_expires_in,
      secretKey: token_protocols.accessToken_secret_key
    })

    const refreshToken = await this.token.generate({ id }, {
      expiresIn: token_protocols.refresh_token_expires_in,
      secretKey: token_protocols.refreshToken_secret_key
    })

    const account = await this.accountRepository.create({
      id,
      ...accountData,
      accessToken,
      refreshToken,
      password: hashedPassword
    })

    return account
  }
}
