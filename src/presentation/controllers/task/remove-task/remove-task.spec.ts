import { type Validator, type HttpRequest, type ValidateError, type RemoveTask, type RemoveTaskError } from './remove-task-protocols'
import { success, type Either, failure } from '../../../../domain/protocols/either'
import { badRequest, notFound, ok, serverError, unauthorized } from '../../../helpers/http-helper'
import { RemoveTaskController } from './remove-task'

const makeFakeRequest = (): HttpRequest => ({
  params: {
    taskId: 'any_taskId'
  },
  accountId: 'any_accountId'
})

const makeRemoveTask = (): RemoveTask => {
  class RemoveTaskStub {
    async remove (): Promise<Either<RemoveTaskError, { message: string }>> {
      return new Promise(resolve => resolve(success({ message: 'any_message' })))
    }
  }
  return new RemoveTaskStub() as unknown as RemoveTask
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
  sut: RemoveTaskController
  removeTaskStub: RemoveTask
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const removeTaskStub = makeRemoveTask()
  const validatorStub = makeValidator()
  const sut = new RemoveTaskController(removeTaskStub, validatorStub)

  return {
    sut,
    removeTaskStub,
    validatorStub
  }
}

describe('RemoveTaskController', () => {
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

    expect(validatorSpy).toHaveBeenCalledWith({ taskId: 'any_taskId', accountId: 'any_accountId' })
  })

  test('Should return 400 if the parameters are not valid', async () => {
    const { sut, validatorStub } = makeSut()

    const validateError: ValidateError = [
      { paramName: 'accountId', message: 'accountId is required' },
      { paramName: 'taskId', message: 'taskId is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockResolvedValueOnce(failure(validateError))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 500 if RemoveTask throws', async () => {
    const { sut, removeTaskStub } = makeSut()

    jest.spyOn(removeTaskStub, 'remove').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call RemoveAccount with correct values', async () => {
    const { sut, removeTaskStub } = makeSut()

    const removeSpy = jest.spyOn(removeTaskStub, 'remove')
    await sut.handle(makeFakeRequest())

    expect(removeSpy).toHaveBeenCalledWith('any_taskId', 'any_accountId')
  })

  test('Should return 404 if the task is not found', async () => {
    const { sut, removeTaskStub } = makeSut()

    jest.spyOn(removeTaskStub, 'remove').mockResolvedValueOnce(failure({ message: 'any_message', type: 'TaskNotFound' }))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: expect.any(String) }))
  })

  test('Should return 401 if invalid account', async () => {
    const { sut, removeTaskStub } = makeSut()

    jest.spyOn(removeTaskStub, 'remove').mockResolvedValueOnce(failure({ message: 'any_message', type: 'InvalidAccount' }))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized({ message: expect.any(String) }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ message: 'any_message' }))
  })
})
