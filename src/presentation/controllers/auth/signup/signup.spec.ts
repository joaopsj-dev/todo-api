import { type Account, type AddAccountData } from '../../../../domain/entities/account'
import { type ValidateError } from '../../../../domain/ports/validate'
import { type AddAccount, type Validator, type HttpRequest } from './signup-protocols'
import { success, type Either, failure } from '../../../../domain/protocols/either'
import { SignUpController } from './signup'
import { badRequest, conflict, ok, serverError } from '../../../helpers/http-helper'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'valid_name',
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

interface SutTypes {
  sut: SignUpController
  addAccountStub: AddAccount
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount()
  const validatorStub = makeValidator()
  const sut = new SignUpController(addAccountStub, validatorStub)

  return {
    sut,
    addAccountStub,
    validatorStub
  }
}

describe('SignUpController', () => {
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
      { paramName: 'name', message: 'name is required' },
      { paramName: 'email', message: 'email is required' },
      { paramName: 'password', message: 'password is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new Promise(resolve => resolve(failure(validateError))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should return 500 if AddAccount throws', async () => {
    const { sut, addAccountStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call AddAccount with request body', async () => {
    const { sut, addAccountStub } = makeSut()

    const addSpy = jest.spyOn(addAccountStub, 'add')
    await sut.handle(makeFakeRequest())

    expect(addSpy).toHaveBeenCalledWith(makeFakeRequest().body)
  })

  test('Should return 409 if AddAccount returns null', async () => {
    const { sut, addAccountStub } = makeSut()

    jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(conflict({ message: 'email already exists' }))
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
