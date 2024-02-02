import { type Account } from '../../../../domain/entities/account'
import { type ValidateError } from '../../../../domain/ports/validate'
import { type Validator, type HttpRequest, type Authenticate, type AuthenticateError } from './login-protocols'
import { success, type Either, failure, type Failure } from '../../../../domain/protocols/either'
import { LoginController } from './login'
import { badRequest, notFound, ok, serverError, unauthorized } from '../../../helpers/http-helper'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: 'valid_email@mail.com',
    password: 'valid_password'
  }
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

const makeAuthenticate = (): Authenticate => {
  class AuthenticateStub {
    async auth ({ email, password }: { email: string, password: string }): Promise<Either<AuthenticateError, Account>> {
      return new Promise(resolve => resolve(success(makeFakeAccount())))
    }
  }
  return new AuthenticateStub() as Authenticate
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
  sut: LoginController
  authenticateStub: Authenticate
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const authenticateStub = makeAuthenticate()
  const validatorStub = makeValidator()
  const sut = new LoginController(authenticateStub, validatorStub)

  return {
    sut,
    authenticateStub,
    validatorStub
  }
}

type FailureByAuthenticate = Failure<AuthenticateError, null>

describe('LoginController', () => {
  test('Should return 500 if Validator throws', async () => {
    const { sut, validatorStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(validatorStub, 'validate').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
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
      { paramName: 'email', message: 'email is required' },
      { paramName: 'password', message: 'password is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new Promise(resolve => resolve(failure(validateError))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should call Authenticate with correct values', async () => {
    const { sut, authenticateStub } = makeSut()

    const authSpy = jest.spyOn(authenticateStub, 'auth')
    await sut.handle(makeFakeRequest())

    expect(authSpy).toHaveBeenCalledWith(makeFakeRequest().body)
  })

  test('Should return 500 if Authenticate throws', async () => {
    const { sut, authenticateStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(authenticateStub, 'auth').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should return 404 if the user is not found', async () => {
    const { sut, authenticateStub } = makeSut()

    const authenticateError = failure({ message: 'user not found' }) as FailureByAuthenticate
    jest.spyOn(authenticateStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(authenticateError)))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: 'user not found' }))
  })

  test('Should return 401 if password is incorrect', async () => {
    const { sut, authenticateStub } = makeSut()

    const authenticateError = failure({ message: 'incorrect password' }) as FailureByAuthenticate
    jest.spyOn(authenticateStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(authenticateError)))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized({ message: 'incorrect password' }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok(expect.objectContaining({
      accessToken: expect.any(String),
      refreshToken: expect.any(String)
    })))
  })
})
