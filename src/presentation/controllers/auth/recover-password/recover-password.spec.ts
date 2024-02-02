import { type Validator, type HttpRequest, type ValidateError, type SendRecoverEmail } from './recover-password-protocols'
import { RecoverPasswordController } from './recover-password'
import { success, type Either, failure } from '../../../../domain/protocols/either'
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: 'valid_email@mail.com'
  }
})

const makeSendRecoverEmail = (): SendRecoverEmail => {
  class SendRecoverEmailStub {
    async send (): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }
  }
  return new SendRecoverEmailStub() as unknown as SendRecoverEmail
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
  sut: RecoverPasswordController
  sendRecoverEmailStub: SendRecoverEmail
  validatorStub: Validator
}

const makeSut = (): SutTypes => {
  const sendRecoverEmailStub = makeSendRecoverEmail()
  const validatorStub = makeValidator()
  const sut = new RecoverPasswordController(sendRecoverEmailStub, validatorStub)

  return {
    sut,
    sendRecoverEmailStub,
    validatorStub
  }
}

describe('RecoverPasswordController', () => {
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
      { paramName: 'email', message: 'email is required' }
    ]
    jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new Promise(resolve => resolve(failure(validateError))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(validateError))
  })

  test('Should call SendRecoverEmail with correct values', async () => {
    const { sut, sendRecoverEmailStub } = makeSut()

    const sendSpy = jest.spyOn(sendRecoverEmailStub, 'send')
    await sut.handle(makeFakeRequest())

    expect(sendSpy).toHaveBeenCalledWith(makeFakeRequest().body.email)
  })

  test('Should return 500 if SendRecoverEmail throws', async () => {
    const { sut, sendRecoverEmailStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(sendRecoverEmailStub, 'send').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(fakeError))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should return 404 if the e-mail is not found', async () => {
    const { sut, sendRecoverEmailStub } = makeSut()

    jest.spyOn(sendRecoverEmailStub, 'send').mockReturnValueOnce(new Promise(resolve => resolve(false)))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(notFound(expect.objectContaining(
      { message: expect.any(String) }
    )))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok(expect.objectContaining({
      message: expect.any(String)
    })))
  })
})
