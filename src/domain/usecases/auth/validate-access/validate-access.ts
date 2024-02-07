import { type Token, type AccountRepository } from './validate-access-protocols'
import token_protocols from '../../../protocols/token'

export class ValidateAccess {
  constructor (
    private readonly accountRespository: AccountRepository,
    private readonly token: Token
  ) {}

  async validate (accessToken: string): Promise<boolean> {
    const parseResponse = await this.token.parse(accessToken, token_protocols.accessToken_secret_key)
    if (parseResponse.isFailure()) return false

    const account = await this.accountRespository.findById(parseResponse.response.payload.id)

    return account ? account.accessToken === accessToken : false
  }
}
