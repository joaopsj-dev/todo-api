import { type HttpRequest, type HttpResponse, type Controller, type UpdateTask, type Validator } from './update-task-protocols'
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper'

export class UpdateTaskController implements Controller {
  constructor (
    private readonly updateTask: UpdateTask,
    private readonly validator: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate({ ...httpRequest.body, taskId: httpRequest.params.taskId })
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const updateTaskResponse = await this.updateTask.update(httpRequest.body, httpRequest.params.taskId)

      if (updateTaskResponse.isFailure()) {
        const { type, message } = updateTaskResponse.error

        return type === 'TaskNotFound'
          ? notFound({ message })
          : badRequest({ message })
      }

      return ok({ message: 'Task successfully updated' })
    } catch (error) {
      return serverError()
    }
  }
}
