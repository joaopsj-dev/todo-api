import { type Task } from '../../../../domain/entities/task'
import { type Validator, type HttpRequest, type ValidateError, type UpdateTask, type UpdateTaskError } from './update-task-protocols'
import { success, type Either, failure, type Failure } from '../../../../domain/protocols/either'
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper'
import { UpdateTaskController } from './update-task'

const notifyDate = new Date(Date.now() + 1000 * 60)
const endDate = new Date(Date.now() + 1000 * 60 * 60)

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'new_name',
    description: 'new_description',
    notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth() + 1, day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
    endDate: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
    isNotify: true,
    status: 'concluded'
  },
  params: {
    taskId: 'any_id'
  }
})

const makeFakeTask = (): Task => ({
  id: 'any_id',
  accountId: 'any_accountId',
  name: 'any_name',
  description: 'any_description',
  notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth(), day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
  endDate: { year: endDate.getFullYear(), month: endDate.getMonth(), day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
  isNotify: true,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeUpdateTask = (): UpdateTask => {
  class UpdateTaskStub {
    async update (): Promise<Either<UpdateTaskError, Task>> {
      return new Promise(resolve => resolve(success(makeFakeTask())))
    }
  }
  return new UpdateTaskStub() as unknown as UpdateTask
}

const makeValidator = (): Validator => {
  class ValidatorStub implements Validator {
    async validate (): Promise<Either<ValidateError, any>> {
      return new Promise(resolve => resolve(success(true)))
    }
  }
  return new ValidatorStub()
}

interface SutTypes {
  sut: UpdateTaskController
  updateTaskStub: UpdateTask
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const updateTaskStub = makeUpdateTask()
  const validatorStub = makeValidator()
  const sut = new UpdateTaskController(updateTaskStub, validatorStub)

  return {
    sut,
    updateTaskStub,
    validatorStub
  }
}

type FailureByUpdateTask = Failure<UpdateTaskError, null>

describe('UpdateTaskController', () => {
  test('Should return 500 if Validator throws', async () => {
    const { sut, validatorStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(validatorStub, 'validate').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call validate method with correct values', async () => {
    const { sut, validatorStub } = makeSut()

    const validatorSpy = jest.spyOn(validatorStub, 'validate')
    await sut.handle(makeFakeRequest())

    expect(validatorSpy).toHaveBeenCalledWith({ ...makeFakeRequest().body, taskId: makeFakeRequest().params.taskId })
  })

  test('Should return 400 if the parameters are not valid', async () => {
    const { sut, validatorStub } = makeSut()

    const validateError: ValidateError = [
      { paramName: 'taskId', message: 'taskId is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockResolvedValueOnce(failure(validateError))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 500 if UpdateTask throws', async () => {
    const { sut, updateTaskStub } = makeSut()

    jest.spyOn(updateTaskStub, 'update').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call UpdateTask with correct values', async () => {
    const { sut, updateTaskStub } = makeSut()

    const updateSpy = jest.spyOn(updateTaskStub, 'update')
    await sut.handle(makeFakeRequest())

    expect(updateSpy).toHaveBeenCalledWith(makeFakeRequest().body, 'any_id')
  })

  test('Should return 404 if the task is not found', async () => {
    const { sut, updateTaskStub } = makeSut()

    const updateTaskError = failure({ message: 'task not found', type: 'TaskNotFound' }) as FailureByUpdateTask
    jest.spyOn(updateTaskStub, 'update').mockResolvedValueOnce(updateTaskError)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: 'task not found' }))
  })

  test('Should return 400 if UpdateTask returns failure with type InvalidDateRange', async () => {
    const { sut, updateTaskStub } = makeSut()

    jest.spyOn(updateTaskStub, 'update').mockResolvedValueOnce(failure({ message: 'any_message', type: 'InvalidDateRange' }))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest({ message: 'any_message' }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ message: expect.any(String) }))
  })
})
