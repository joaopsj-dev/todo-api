import { type HttpRequest, type HttpResponse, type Controller, type GetTasksFromAccount } from './get-tasks-protocols'
import { ok, serverError, unauthorized } from '../../../helpers/http-helper'

export class GetTasksController implements Controller {
  constructor (
    private readonly getTasksFromAccount: GetTasksFromAccount
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const tasks = await this.getTasksFromAccount.get(httpRequest.accountId)

      return tasks ? ok(tasks) : unauthorized({ message: 'you can only get a tasks that belongs to you' })
    } catch (error) {
      return serverError()
    }
  }
}
