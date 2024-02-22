import { type Validator, type HttpRequest, type ValidateError, type GetAccount } from './get-account-protocols'
import { success, type Either, failure } from '../../../../domain/protocols/either'
import { type Account, type AccountDto } from '../../../../domain/entities/account'
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper'
import { GetAccountController } from './get-account'

const makeFakeRequest = (): HttpRequest => ({
  accountId: 'any_id'
})

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_refreshToken',
  accessToken: 'any_accessToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeGetAccount = (): GetAccount => {
  class GetAccountStub {
    async get (): Promise<AccountDto> {
      const { name, email, createdAt, updatedAt } = makeFakeAccount()
      return new Promise(resolve => resolve({
        name, email, createdAt, updatedAt
      }))
    }
  }
  return new GetAccountStub() as unknown as GetAccount
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
  sut: GetAccountController
  getAccountStub: GetAccount
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const getAccountStub = makeGetAccount()
  const validatorStub = makeValidator()
  const sut = new GetAccountController(getAccountStub, validatorStub)

  return {
    sut,
    getAccountStub,
    validatorStub
  }
}

describe('GetAccountController', () => {
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

  test('Should return 500 if GetAccount throws', async () => {
    const { sut, getAccountStub } = makeSut()

    jest.spyOn(getAccountStub, 'get').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call GetAccount with correct values', async () => {
    const { sut, getAccountStub } = makeSut()

    const getSpy = jest.spyOn(getAccountStub, 'get')
    await sut.handle(makeFakeRequest())

    expect(getSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return 404 if the account is not found', async () => {
    const { sut, getAccountStub } = makeSut()

    jest.spyOn(getAccountStub, 'get').mockResolvedValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: expect.any(String) }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())
    const { name, email } = makeFakeAccount()

    expect(httpResponse).toEqual(ok({ name, email, createdAt: expect.any(Date), updatedAt: expect.any(Date) }))
  })
})
