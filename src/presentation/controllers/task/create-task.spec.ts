import { type HttpRequest, type CreateTask, type ValidateError, type Validator, type CreateTaskError } from './create-task-protocols'
import { type AddTaskData, type Task } from '../../../domain/entities/task'
import { type Either, success, failure } from '../../../domain/protocols/either'
import { CreateTaskController } from './create-task'
import { badRequest, notFound, ok, serverError } from '../../helpers/http-helper'

const notifyDate = new Date(Date.now() + 5000)
const endDate = new Date(Date.now() + 10000)
const createdAt = new Date()
const updatedAt = new Date()

const makeFakeRequest = (): HttpRequest => ({
  body: {
    accountId: 'any_accountId',
    name: 'any_name',
    description: 'any_description',
    notifyDate,
    endDate,
    isNotify: true
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
  createdAt,
  updatedAt
})

const makeValidator = (): Validator => {
  class ValidatorStub implements Validator {
    async validate (data: any): Promise<Either<ValidateError, any>> {
      return new Promise(resolve => resolve(success(true)))
    }
  }
  return new ValidatorStub()
}

const makeCreateTask = (): CreateTask => {
  class CreateTaskStub {
    async create (taskData: AddTaskData): Promise<Either<CreateTaskError, Task>> {
      return new Promise(resolve => resolve(success(makeFakeTask())))
    }
  }
  return new CreateTaskStub() as unknown as CreateTask
}

interface SutTypes {
  sut: CreateTaskController
  createTaskStub: CreateTask
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const validatorStub = makeValidator()
  const createTaskStub = makeCreateTask()
  const sut = new CreateTaskController(validatorStub, createTaskStub)

  return {
    sut,
    validatorStub,
    createTaskStub
  }
}

describe('CreateTaskController', () => {
  test('Should return 500 if Validator throws', async () => {
    const { sut, validatorStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(validatorStub, 'validate').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should call validate method with request body', async () => {
    const { sut, validatorStub } = makeSut()

    const validatorSpy = jest.spyOn(validatorStub, 'validate')
    await sut.handle(makeFakeRequest())

    expect(validatorSpy).toHaveBeenCalledWith(makeFakeRequest().body)
  })

  test('Should return 400 if the parameters are not valid', async () => {
    const { sut, validatorStub } = makeSut()

    const validateError: ValidateError = [
      { paramName: 'name', message: 'name is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new Promise(resolve => resolve(failure(validateError))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 500 if CreateTask throws', async () => {
    const { sut, createTaskStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(createTaskStub, 'create').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should call CreateTask with request body', async () => {
    const { sut, createTaskStub } = makeSut()

    const addSpy = jest.spyOn(createTaskStub, 'create')
    await sut.handle(makeFakeRequest())

    expect(addSpy).toHaveBeenCalledWith(makeFakeRequest().body)
  })

  test('Should return 404 if CreateTask returns failure with type AccountNotFound', async () => {
    const { sut, createTaskStub } = makeSut()

    jest.spyOn(createTaskStub, 'create').mockReturnValueOnce(new Promise(resolve => resolve(failure({ message: 'any_message', type: 'AccountNotFound' }))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: 'any_message' }))
  })

  test('Should return 400 if CreateTask returns failure with type InvalidDateRange', async () => {
    const { sut, createTaskStub } = makeSut()

    jest.spyOn(createTaskStub, 'create').mockReturnValueOnce(new Promise(resolve => resolve(failure({ message: 'any_message', type: 'InvalidDateRange' }))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest({ message: 'any_message' }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({ task: makeFakeTask() }))
  })
})
