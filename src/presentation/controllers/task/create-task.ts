import { type Validator, type Controller, type HttpRequest, type HttpResponse, type CreateTask } from './create-task-protocols'
import { badRequest, notFound, serverError, ok } from '../../helpers/http-helper'

export class CreateTaskController implements Controller {
  constructor (
    private readonly validator: Validator,
    private readonly createTask: CreateTask
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate(httpRequest.body)
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const createTaskResponse = await this.createTask.create(httpRequest.body)

      if (createTaskResponse.isFailure()) {
        const { message, type } = createTaskResponse.error

        return type === 'AccountNotFound'
          ? notFound({ message })
          : badRequest({ message })
      }

      return ok({ task: createTaskResponse.response })
    } catch (error) {
      return serverError()
    }
  }
}
