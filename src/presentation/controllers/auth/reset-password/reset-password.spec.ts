import { type ResetPassword, type ValidateError, type Validator, type HttpRequest, type Token, type GenerateOptions } from './reset-password-protocols'
import { type Account } from '../../../../domain/entities/account'
import { success, type Either, failure } from '../../../../domain/protocols/either'
import { badRequest, notFound, ok, serverError, unauthorized } from '../../../helpers/http-helper'
import { ResetPasswordController } from './reset-password'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_refreshToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeFakeRequest = (): HttpRequest => ({
  body: {
    password: 'valid_password'
  },
  headers: {
    authorization: 'Bearer valid_recoverPasswordToken'
  }
})

const makeResetPassword = (): ResetPassword => {
  class ResetPasswordStub {
    async reset (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }
  return new ResetPasswordStub() as unknown as ResetPassword
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
    async parse (): Promise<any> {
      return new Promise(resolve => resolve(success({ payload: { id: 'any_id' }, expiresIn: 0, createdIn: 0 })))
    }

    generate: (payload: any, generateOptions: GenerateOptions) => Promise<string>
  }
  return new TokenProviderStub()
}

interface SutTypes {
  sut: ResetPasswordController
  resetPasswordStub: ResetPassword
  validatorStub: Validator
  tokenStub: Token
}

const makeSut = (): SutTypes => {
  const resetPasswordStub = makeResetPassword()
  const validatorStub = makeValidator()
  const tokenStub = makeTokenProvider()
  const sut = new ResetPasswordController(resetPasswordStub, validatorStub, tokenStub)

  return {
    sut,
    resetPasswordStub,
    validatorStub,
    tokenStub
  }
}

describe('ResetPasswordController', () => {
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
      { paramName: 'password', message: 'password is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new Promise(resolve => resolve(failure(validateError))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 500 if Token throws', async () => {
    const { sut, tokenStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(tokenStub, 'parse').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should call parse method with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenSpy = jest.spyOn(tokenStub, 'parse')
    await sut.handle(makeFakeRequest())

    expect(tokenSpy).toHaveBeenCalledWith('valid_recoverPasswordToken', expect.any(String))
  })

  test('Should return 401 if invalid token', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse').mockReturnValueOnce(new Promise(resolve => resolve(failure({ name: 'any_nameError', message: 'any_messageError' }))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized({ message: expect.any(String) }))
  })

  test('Should return 500 if ResetPassword usecase throws', async () => {
    const { sut, resetPasswordStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(resetPasswordStub, 'reset').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(fakeError))
  })

  test('Should call ResetPassword usecase with correct values', async () => {
    const { sut, resetPasswordStub } = makeSut()

    const resetSpy = jest.spyOn(resetPasswordStub, 'reset')
    await sut.handle(makeFakeRequest())

    expect(resetSpy).toHaveBeenCalledWith({
      password: 'valid_password',
      accountId: 'any_id'
    })
  })

  test('Should return 404 if ResetPassword usecase return null', async () => {
    const { sut, resetPasswordStub } = makeSut()

    jest.spyOn(resetPasswordStub, 'reset').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: expect.any(String) }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ message: expect.any(String) }))
  })
})
