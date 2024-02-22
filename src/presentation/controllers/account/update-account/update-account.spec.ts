import { type Account } from '../../../../domain/entities/account'
import { type Validator, type HttpRequest, type ValidateError, type UpdateAccount, type UpdateAccountError } from './update-account-protocols'
import { success, type Either, failure, type Failure } from '../../../../domain/protocols/either'
import { badRequest, conflict, notFound, ok, serverError } from '../../../helpers/http-helper'
import { UpdateAccountController } from './update-account'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: 'new_email@mail.com',
    password: 'new_password'
  },
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

const makeUpdateAccount = (): UpdateAccount => {
  class UpdateAccountStub {
    async update (): Promise<Either<UpdateAccountError, Account>> {
      return new Promise(resolve => resolve(success(makeFakeAccount())))
    }
  }
  return new UpdateAccountStub() as unknown as UpdateAccount
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
  sut: UpdateAccountController
  updateAccountStub: UpdateAccount
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const updateAccountStub = makeUpdateAccount()
  const validatorStub = makeValidator()
  const sut = new UpdateAccountController(updateAccountStub, validatorStub)

  return {
    sut,
    updateAccountStub,
    validatorStub
  }
}

type FailureByUpdateAccount = Failure<UpdateAccountError, null>

describe('UpdateAccountController', () => {
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

    expect(validatorSpy).toHaveBeenCalledWith({ ...makeFakeRequest().body, accountId: 'any_id' })
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

  test('Should return 500 if UpdateAccount throws', async () => {
    const { sut, updateAccountStub } = makeSut()

    jest.spyOn(updateAccountStub, 'update').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call UpdateAccount with correct values', async () => {
    const { sut, updateAccountStub } = makeSut()

    const updateSpy = jest.spyOn(updateAccountStub, 'update')
    await sut.handle(makeFakeRequest())

    expect(updateSpy).toHaveBeenCalledWith(makeFakeRequest().body, 'any_id')
  })

  test('Should return 404 if the account is not found', async () => {
    const { sut, updateAccountStub } = makeSut()

    const updateAccountError = failure({ message: 'account not found' }) as FailureByUpdateAccount
    jest.spyOn(updateAccountStub, 'update').mockResolvedValueOnce(updateAccountError)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound({ message: 'account not found' }))
  })

  test('Should return 409 if the email already exists ', async () => {
    const { sut, updateAccountStub } = makeSut()

    const updateAccountError = failure({ message: 'email already exists' }) as FailureByUpdateAccount
    jest.spyOn(updateAccountStub, 'update').mockResolvedValueOnce(updateAccountError)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(conflict({ message: 'email already exists' }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ message: expect.any(String) }))
  })
})
