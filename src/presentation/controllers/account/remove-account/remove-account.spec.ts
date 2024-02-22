import { type Validator, type HttpRequest, type ValidateError, type RemoveAccount } from './remove-account-protocols'
import { success, type Either, failure } from '../../../../domain/protocols/either'
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper'
import { RemoveAccountController } from './remove-account'

const makeFakeRequest = (): HttpRequest => ({
  accountId: 'any_id'
})

const makeRemoveAccount = (): RemoveAccount => {
  class RemoveAccountStub {
    async remove (): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }
  }
  return new RemoveAccountStub() as unknown as RemoveAccount
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
  sut: RemoveAccountController
  removeAccountStub: RemoveAccount
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const removeAccountStub = makeRemoveAccount()
  const validatorStub = makeValidator()
  const sut = new RemoveAccountController(removeAccountStub, validatorStub)

  return {
    sut,
    removeAccountStub,
    validatorStub
  }
}

describe('RemoveAccountController', () => {
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

    expect(validatorSpy).toHaveBeenCalledWith(makeFakeRequest())
  })

  test('Should return 400 if the parameters are not valid', async () => {
    const { sut, validatorStub } = makeSut()

    const validateError: ValidateError = [
      { paramName: 'accountId', message: 'accountId is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockResolvedValueOnce(failure(validateError))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 500 if RemoveAccount throws', async () => {
    const { sut, removeAccountStub } = makeSut()

    jest.spyOn(removeAccountStub, 'remove').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call RemoveAccount with correct values', async () => {
    const { sut, removeAccountStub } = makeSut()

    const removeSpy = jest.spyOn(removeAccountStub, 'remove')
    await sut.handle(makeFakeRequest())

    expect(removeSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return 404 if the account is not found', async () => {
    const { sut, removeAccountStub } = makeSut()

    jest.spyOn(removeAccountStub, 'remove').mockResolvedValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: expect.any(String) }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ message: expect.any(String) }))
  })
})
