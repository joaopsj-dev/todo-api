import { type HttpRequest, type HttpResponse, type Controller, type GetAccount, type Validator } from './get-account-protocols'
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper'

export class GetAccountController implements Controller {
  constructor (
    private readonly getAccount: GetAccount,
    private readonly validator: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate({ accountId: httpRequest.params.accountId })
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const account = await this.getAccount.get(httpRequest.params.accountId)

      return account ? ok(account) : notFound({ message: 'Account not found' })
    } catch (error) {
      return serverError()
    }
  }
}
