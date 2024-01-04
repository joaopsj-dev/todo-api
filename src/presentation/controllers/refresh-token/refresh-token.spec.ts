import { type RefreshToken, type ValidateError, type Validator, type HttpRequest } from './refresh-token-protocols'
import { success, type Either, failure } from '../../../domain/protocols/either'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http-helper'
import { RefreshTokenController } from './refresh-token'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    refreshToken: 'valid_refreshToken'
  }
})

const makeRefreshToken = (): RefreshToken => {
  class RefreshTokenStub {
    async refresh (): Promise<string> {
      return new Promise(resolve => resolve('accessToken'))
    }
  }
  return new RefreshTokenStub() as unknown as RefreshToken
}

const makeValidator = (): Validator => {
  class ValidatorStub implements Validator {
    async validate (data: any): Promise<Either<ValidateError, any>> {
      return new Promise(resolve => resolve(success(true)))
    }
  }
  return new ValidatorStub()
}

interface SutTypes {
  sut: RefreshTokenController
  refreshTokenStub: RefreshToken
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const refreshTokenStub = makeRefreshToken()
  const validatorStub = makeValidator()
  const sut = new RefreshTokenController(refreshTokenStub, validatorStub)

  return {
    sut,
    refreshTokenStub,
    validatorStub
  }
}

describe('RefreshTokenController', () => {
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
      { paramName: 'refreshToken', message: 'refreshToken is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new Promise(resolve => resolve(failure(validateError))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 500 if RefreshToken usecase throws', async () => {
    const { sut, refreshTokenStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(refreshTokenStub, 'refresh').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should call RefreshToken usecase with body refresh token', async () => {
    const { sut, refreshTokenStub } = makeSut()

    const refreshSpy = jest.spyOn(refreshTokenStub, 'refresh')
    await sut.handle(makeFakeRequest())

    expect(refreshSpy).toHaveBeenCalledWith('valid_refreshToken')
  })

  test('Should return 401 if RefreshToken usecase return null', async () => {
    const { sut, refreshTokenStub } = makeSut()

    jest.spyOn(refreshTokenStub, 'refresh').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized({ message: expect.any(String) }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ accessToken: 'accessToken' }))
  })
})
