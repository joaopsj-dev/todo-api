import { type Authenticate, type Validator, type Token, type Controller, type HttpRequest, type HttpResponse } from './login-protocols'
import { badRequest, notFound, ok, serverError, unauthorized } from '../../../helpers/http-helper'
import token_protocols from '../../../../domain/protocols/token'

export class LoginController implements Controller {
  constructor (
    private readonly authenticate: Authenticate,
    private readonly validate: Validator,
    private readonly token: Token
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validate.validate(httpRequest.body)
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const authenticateResponse = await this.authenticate.auth({ email: httpRequest.body.email, password: httpRequest.body.password })

      if (authenticateResponse.isFailure()) {
        const { message } = authenticateResponse.error
        const isNotFound = message.includes('not found')

        return isNotFound
          ? notFound({ message })
          : unauthorized({ message })
      }

      const { id, refreshToken } = authenticateResponse.response

      const accessToken = await this.token.generate({ id }, {
        expiresIn: token_protocols.access_token_expires_in,
        secretKey: token_protocols.accessToken_secret_key
      })

      return ok({ accessToken, refreshToken })
    } catch (error) {
      return serverError()
    }
  }
}
