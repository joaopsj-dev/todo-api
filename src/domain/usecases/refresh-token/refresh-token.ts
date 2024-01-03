import { type Token } from '../../ports/token'
import { type AccountRepository } from '../authenticate/authenticate-protocols';
import token_protocols from '../../protocols/token';

export class RefreshToken {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly token: Token
  ) {}

  async refresh (refreshToken: string): Promise<string> {
    console.log('1: ' + refreshToken);
    const parsedResult = await this.token.parse(refreshToken, token_protocols.refreshToken_secret_key)
    if (parsedResult.isFailure()) return null

    const { payload, expiresIn } = parsedResult.response

    console.log('17: ' + expiresIn, payload);

    const { refreshToken: accountRefreshToken } = await this.accountRepository.findById(payload.id)

    const parsedAccountTokenResult = await this.token.parse(accountRefreshToken, token_protocols.refreshToken_secret_key)
    if (parsedAccountTokenResult.isFailure()) return null

    const { expiresIn: accountTokenExpiresIn } = parsedAccountTokenResult.response
    console.log('26: ' + expiresIn, accountTokenExpiresIn);

    if (expiresIn < accountTokenExpiresIn) return null

    const newAccessToken = await this.token.generate(payload, {
      secretKey: token_protocols.accessToken_secret_key,
      expiresIn: token_protocols.access_token_expires_in
    })

    return newAccessToken
  }
}
