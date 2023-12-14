import { type Validator, type Token, type Controller, type AddAccount, type HttpRequest, type HttpResponse } from './signup-protocols'
import { badRequest, conflict, ok, serverError } from '../../helpers/http-helper'

export class SignUpController implements Controller {
  constructor (
    private readonly addAccount: AddAccount,
    private readonly validate: Validator,
    private readonly token: Token
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

      const accessToken = await this.token.generate({
        id: account.id,
        email: account.email
      })

      return ok({ accessToken })
    } catch (error) {
      return serverError(error as any)
    }
  }
}
