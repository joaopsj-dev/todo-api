import { type Account } from '../../../domain/entities/account'
import { type ValidateError } from '../../../domain/ports/validate'
import { type Token, type Validator, type HttpRequest, type Authenticate, type AuthenticateError } from './login-protocols'
import { success, type Either, failure, type Failure } from '../../../domain/protocols/either'
import { LoginController } from './login'
import { badRequest, notFound, ok, serverError, unauthorized } from '../../helpers/http-helper'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: 'any_email@mail.com',
    password: 'any_password'
  }
})

const makeFakeAccount = (): Account => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email',
  password: 'hashed_password'
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
    async validate (data: any): Promise<Either<ValidateError, any>> {
      return new Promise(resolve => resolve(success(true)))
    }
  }
  return new ValidatorStub()
}

const makeTokenProvider = (): Token => {
  class TokenProviderStub implements Token {
    async generate (payload: any): Promise<string> {
      return new Promise(resolve => resolve('token'))
    }

    async parse (token: string): Promise<any> {
      return new Promise(resolve => resolve(null))
    }
  }
  return new TokenProviderStub()
}

interface SutTypes {
  sut: LoginController
  authenticateStub: Authenticate
  validatorStub: Validator
  tokenProviderStub: Token
}

const makeSut = (): SutTypes => {
  const authenticateStub = makeAuthenticate()
  const validatorStub = makeValidator()
  const tokenProviderStub = makeTokenProvider()
  const sut = new LoginController(authenticateStub, validatorStub, tokenProviderStub)

  return {
    sut,
    authenticateStub,
    validatorStub,
    tokenProviderStub
  }
}

type FailureByAuthenticate = Failure<AuthenticateError, null>

describe('SignUpController', () => {
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

  test('Should return 500 if Authenticate throws', async () => {
    const { sut, authenticateStub } = makeSut()
    const fakeError = new Error()
    jest.spyOn(authenticateStub, 'auth').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should return 500 if TokenProvider throws', async () => {
    const { sut, tokenProviderStub } = makeSut()
    const fakeError = new Error()
    jest.spyOn(tokenProviderStub, 'generate').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should return 500 if Validator throws', async () => {
    const { sut, validatorStub } = makeSut()
    const fakeError = new Error()
    jest.spyOn(validatorStub, 'validate').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should call Authenticate with correct values', async () => {
    const { sut, authenticateStub } = makeSut()
    const loginSpy = jest.spyOn(authenticateStub, 'auth')
    await sut.handle(makeFakeRequest())
    expect(loginSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should call Generate Token with correct values', async () => {
    const { sut, tokenProviderStub } = makeSut()
    const generateTokenSpy = jest.spyOn(tokenProviderStub, 'generate')
    await sut.handle(makeFakeRequest())
    expect(generateTokenSpy).toHaveBeenCalledWith({ id: 'valid_id', email: 'valid_email' })
  })

  test('Should call Validator with correct values', async () => {
    const { sut, validatorStub } = makeSut()
    const validatorSpy = jest.spyOn(validatorStub, 'validate')
    await sut.handle(makeFakeRequest())
    expect(validatorSpy).toHaveBeenCalledWith(makeFakeRequest().body)
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({ accessToken: 'token' }))
  })
})
