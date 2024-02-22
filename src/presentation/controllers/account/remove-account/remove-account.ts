import { type HttpRequest, type HttpResponse, type Controller, type RemoveAccount, type Validator } from './remove-account-protocols'
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper'

export class RemoveAccountController implements Controller {
  constructor (
    private readonly removeAccount: RemoveAccount,
    private readonly validator: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate({ accountId: httpRequest.accountId })
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      if (!(await this.removeAccount.remove(httpRequest.accountId))) return notFound({ message: 'Account not found' })

      return ok({ message: 'Account successfully removed' })
    } catch (error) {
      return serverError()
    }
  }
}
