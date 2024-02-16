import { type Token, type AccountRepository, type Account } from './validate-access-protocols'
import token_protocols from '../../../protocols/token'

export class ValidateAccess {
  constructor (
    private readonly accountRespository: AccountRepository,
    private readonly token: Token
  ) {}

  async validate (accessToken: string): Promise<Account> {
    const parseResponse = await this.token.parse(accessToken, token_protocols.accessToken_secret_key)
    if (parseResponse.isFailure()) return null

    const account = await this.accountRespository.findById(parseResponse.response.payload.id)

    return account?.accessToken === accessToken ? account : null
  }
}
