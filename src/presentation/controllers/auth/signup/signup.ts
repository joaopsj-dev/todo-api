import { type Validator, type Controller, type AddAccount, type HttpRequest, type HttpResponse } from './signup-protocols'
import { badRequest, conflict, ok, serverError } from '../../../helpers/http-helper'

export class SignUpController implements Controller {
  constructor (
    private readonly addAccount: AddAccount,
    private readonly validate: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validate.validate(httpRequest.body)
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const account = await this.addAccount.add(httpRequest.body)

      if (!account) {
        return conflict({ message: 'email already exists' })
      }

      return ok({ accessToken: account.accessToken, refreshToken: account.refreshToken })
    } catch (error) {
      return serverError()
    }
  }
}
