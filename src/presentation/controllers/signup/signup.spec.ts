import { type Account, type AddAccountData } from '../../../domain/entities/account'
import { type ValidateError } from '../../../domain/ports/validate'
import { type Token, type AddAccount, type Validator, type HttpRequest } from './signup-protocols'
import { success, type Either, failure } from '../../../domain/protocols/either'
import { SignUpController } from './signup'
import { badRequest, conflict, ok, serverError } from '../../helpers/http-helper'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
})

const makeFakeAccount = (): Account => ({
  id: 'valid_id',
  refreshToken: null,
  name: 'valid_name',
  email: 'valid_email',
  password: 'hashed_password'
})

const makeAddAccount = (): AddAccount => {
  class AddAccountStub {
    async add (accountData: AddAccountData): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }
  return new AddAccountStub() as AddAccount
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
    async generate (): Promise<string> {
      return new Promise(resolve => resolve('token'))
    }

    async parse (): Promise<any> {
      return new Promise(resolve => resolve(null))
    }
  }
  return new TokenProviderStub()
}

interface SutTypes {
  sut: SignUpController
  addAccountStub: AddAccount
  validatorStub: Validator
  tokenProviderStub: Token
}

const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount()
  const validatorStub = makeValidator()
  const tokenProviderStub = makeTokenProvider()
  const sut = new SignUpController(addAccountStub, validatorStub, tokenProviderStub)

  return {
    sut,
    addAccountStub,
    validatorStub,
    tokenProviderStub
  }
}

describe('SignUpController', () => {
  test('Should return 400 if the parameters are not valid', async () => {
    const { sut, validatorStub } = makeSut()
    const validateError: ValidateError = [
      { paramName: 'name', message: 'name is required' },
      { paramName: 'email', message: 'email is required' },
      { paramName: 'password', message: 'password is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new Promise(resolve => resolve(failure(validateError))))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 409 if email already exists', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(conflict({ message: 'email already exists' }))
  })

  test('Should return 500 if AddAccount throws', async () => {
    const { sut, addAccountStub } = makeSut()
    const fakeError = new Error()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
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

  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut()
    const signUpSpy = jest.spyOn(addAccountStub, 'add')
    await sut.handle(makeFakeRequest())
    expect(signUpSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should call Generate Token with correct values', async () => {
    const { sut, tokenProviderStub, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeAccount())))

    const accessTokenSpy = jest.spyOn(tokenProviderStub, 'generate')
    const refreshTokenSpy = jest.spyOn(tokenProviderStub, 'generate')

    await sut.handle(makeFakeRequest())

    expect(accessTokenSpy).toHaveBeenCalledWith({ id: 'valid_id' }, expect.objectContaining({
      expiresIn: expect.any(String),
      secretKey: expect.any(String)
    }))
    expect(refreshTokenSpy).toHaveBeenCalledWith({ id: 'valid_id' }, expect.objectContaining({
      expiresIn: expect.any(String),
      secretKey: expect.any(String)
    }))
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
    expect(httpResponse).toEqual(ok(expect.objectContaining({
      accessToken: expect.any(String),
      refreshToken: expect.any(String)
    })))
  })
})
