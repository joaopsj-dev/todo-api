import { type Validator, type Controller, type HttpRequest, type HttpResponse, type RefreshToken } from './refresh-token-protocols'
import { badRequest, ok, serverError, unauthorized } from '../../../helpers/http-helper'

export class RefreshTokenController implements Controller {
  constructor (
    private readonly refreshToken: RefreshToken,
    private readonly validate: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validate.validate(httpRequest.body)
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const { refreshToken } = httpRequest.body

      const newAccessToken = await this.refreshToken.refresh(refreshToken)
      if (!newAccessToken) {
        return unauthorized({ message: 'invalid refresh token, required login' })
      }

      return ok({
        accessToken: newAccessToken
      })
    } catch (error) {
      return serverError()
    }
  }
}
