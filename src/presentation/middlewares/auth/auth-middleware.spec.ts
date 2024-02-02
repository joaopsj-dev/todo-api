import { type Token } from './auth-middleware-protocols'
import { type HttpRequest } from '../../protocols'
import { failure, success } from '../../../domain/protocols/either'
import { forbidden, ok, serverError } from '../../helpers/http-helper'
import { AuthMiddleware } from './auth-middleware'

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    'x-access-token': 'any_accessToken'
  }
})

const makeTokenProvider = (): Token => {
  class TokenProviderStub implements Token {
    async parse (): Promise<any> {
      return new Promise(resolve => resolve(success({})))
    }

    generate: () => Promise<string>
  }
  return new TokenProviderStub()
}

interface SutTypes {
  sut: AuthMiddleware
  tokenStub: Token
}

const makeSut = (): SutTypes => {
  const tokenStub = makeTokenProvider()
  const sut = new AuthMiddleware(tokenStub)

  return {
    sut,
    tokenStub
  }
}

describe('Auth Middleware', () => {
  test('Should return 500 if Token throws', async () => {
    const { sut, tokenStub } = makeSut()

    const fakeError = new Error()
    jest.spyOn(tokenStub, 'parse').mockRejectedValueOnce(fakeError)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call parse method with request body', async () => {
    const { sut, tokenStub } = makeSut()

    const parseSpy = jest.spyOn(tokenStub, 'parse')
    await sut.handle(makeFakeRequest())

    expect(parseSpy).toHaveBeenCalledWith('any_accessToken', expect.any(String))
  })

  test('Should return 403 if invalid token', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse').mockReturnValueOnce(new Promise(resolve => resolve(failure({ name: 'any_nameError', message: 'any_messageError' }))))
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden({ message: expect.any(String) }))
  })

  test('Should return 200 if valid access token', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({}))
  })
})
