import { type ValidateAccess, type HttpRequest } from './auth-middleware-protocols'
import { type Account } from '../../../domain/entities/account'
import { forbidden, ok, serverError } from '../../helpers/http-helper'
import { AuthMiddleware } from './auth-middleware'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_account_refreshToken',
  accessToken: 'any_accessToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    'x-access-token': 'any_accessToken'
  }
})

const makeValidateAccess = (): ValidateAccess => {
  class ValidateAccessStub {
    async validate (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }
  return new ValidateAccessStub() as unknown as ValidateAccess
}

interface SutTypes {
  sut: AuthMiddleware
  validateAccessStub: ValidateAccess
}

const makeSut = (): SutTypes => {
  const validateAccessStub = makeValidateAccess()
  const sut = new AuthMiddleware(validateAccessStub)

  return {
    sut,
    validateAccessStub
  }
}

describe('Auth Middleware', () => {
  test('Should return 500 if Validator throws', async () => {
    const { sut, validateAccessStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(validateAccessStub, 'validate').mockRejectedValueOnce(fakeError)

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call validate method with access token', async () => {
    const { sut, validateAccessStub } = makeSut()

    const validateSpy = jest.spyOn(validateAccessStub, 'validate')
    await sut.handle(makeFakeRequest())

    expect(validateSpy).toHaveBeenCalledWith('any_accessToken')
  })

  test('Should return 403 if validateAccess return null', async () => {
    const { sut, validateAccessStub } = makeSut()

    jest.spyOn(validateAccessStub, 'validate').mockResolvedValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden({ message: expect.any(String) }))
  })

  test('Should return 200 if valid access token', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ accountId: 'any_id' }))
  })
})
