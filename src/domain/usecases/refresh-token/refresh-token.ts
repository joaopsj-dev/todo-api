import { type Token, type AccountRepository } from './refresh-token-protocols'
import token_protocols from '../../protocols/token';

export class RefreshToken {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly token: Token
  ) {}

  async refresh (refreshToken: string): Promise<string> {
    const parsedResult = await this.token.parse(refreshToken, token_protocols.refreshToken_secret_key)
    if (parsedResult.isFailure()) return null

    const { payload, expiresIn } = parsedResult.response

    const accountByToken = await this.accountRepository.findById(payload.id)
    if (!accountByToken) return null

    const parsedAccountTokenResult = await this.token.parse(accountByToken.refreshToken, token_protocols.refreshToken_secret_key)
    if (parsedAccountTokenResult.isFailure()) return null

    const { expiresIn: accountTokenExpiresIn } = parsedAccountTokenResult.response
    if (expiresIn < accountTokenExpiresIn) return null

    const newAccessToken = await this.token.generate(payload, {
      secretKey: token_protocols.accessToken_secret_key,
      expiresIn: token_protocols.access_token_expires_in
    })

    return newAccessToken
  }
}
