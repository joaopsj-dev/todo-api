import { type HttpRequest, type HttpResponse, type Controller, type RemoveTask, type Validator } from './remove-task-protocols'
import { badRequest, notFound, ok, serverError, unauthorized } from '../../../helpers/http-helper'

export class RemoveTaskController implements Controller {
  constructor (
    private readonly removeTask: RemoveTask,
    private readonly validator: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate({ taskId: httpRequest.params.taskId, accountId: httpRequest.accountId })
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const removedTask = await this.removeTask.remove(httpRequest.params.taskId, httpRequest.accountId)

      if (removedTask.isFailure()) {
        const { message, type } = removedTask.error

        return type === 'TaskNotFound'
          ? notFound({ message })
          : unauthorized({ message })
      }

      return ok(removedTask.response)
    } catch (error) {
      return serverError()
    }
  }
}
