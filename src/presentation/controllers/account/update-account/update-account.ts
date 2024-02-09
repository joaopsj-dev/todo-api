import { type HttpRequest, type HttpResponse, type Controller, type UpdateAccount, type Validator } from './update-account-protocols'
import { badRequest, conflict, notFound, ok, serverError } from '../../../helpers/http-helper'

export class UpdateAccountController implements Controller {
  constructor (
    private readonly updateAccount: UpdateAccount,
    private readonly validator: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate({ ...httpRequest.body, accountId: httpRequest.params.accountId })
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const updateAccountResponse = await this.updateAccount.update(httpRequest.body, httpRequest.params.accountId)

      if (updateAccountResponse.isFailure()) {
        const { message } = updateAccountResponse.error
        const isNotFound = message.includes('not found')

        return isNotFound
          ? notFound({ message })
          : conflict({ message })
      }

      return ok({ message: 'Account successfully updated' })
    } catch (error) {
      return serverError()
    }
  }
}
