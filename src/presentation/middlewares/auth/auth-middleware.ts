import { type Token, type HttpResponse, type HttpRequest, type Middleware } from './auth-middleware-protocols'
import { forbidden, ok, serverError } from '../../helpers/http-helper';
import token_protocols from '../../../domain/protocols/token';

export class AuthMiddleware implements Middleware {
  constructor (
    private readonly token: Token
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const accessToken = httpRequest.headers?.['x-access-token']
      const tokenResponse = await this.token.parse(accessToken, token_protocols.accessToken_secret_key)

      if (tokenResponse.isFailure()) {
        return forbidden({ message: 'Access denied' })
      }

      return ok({})
    } catch (error) {
      return serverError()
    }
  }
}
