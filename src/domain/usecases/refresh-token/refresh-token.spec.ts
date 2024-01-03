import { type Token, type AccountRepository } from './refresh-token-protocols'
import { type Account } from '../../entities/account'
import { RefreshToken } from './refresh-token'
import { failure, success } from '../../protocols/either'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_refresh_token',
  name: 'any_name',
  email: 'any_email',
  password: 'hashed_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub {
    async findById (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }
  return new AccountRepositoryStub() as unknown as AccountRepository
}

const makeTokenProvider = (): Token => {
  class TokenProviderStub implements Token {
    async generate (): Promise<string> {
      return new Promise(resolve => resolve('accessToken'))
    }

    async parse (): Promise<any> {
      return new Promise(resolve => resolve(success({ payload: { id: '' }, expiresIn: 0, createdIn: 0 })))
    }
  }
  return new TokenProviderStub()
}

interface SutTypes {
  sut: RefreshToken
  accountRepositoryStub: AccountRepository
  tokenStub: Token
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const tokenStub = makeTokenProvider()
  const sut = new RefreshToken(accountRepositoryStub, tokenStub)

  return {
    sut,
    accountRepositoryStub,
    tokenStub
  }
}

describe('Authenticate UseCase', () => {
  test('Should return a null if invalid refreshToken', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse').mockReturnValueOnce(new Promise(resolve => resolve(failure(null))))
    const response = await sut.refresh('invalid_refreshToken')
    expect(response).toBeNull()
  })

  test('Should call token parse with correct value', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenParseSpy = jest.spyOn(tokenStub, 'parse')
    await sut.refresh('any_refreshToken')
    expect(tokenParseSpy).toHaveBeenCalledWith('any_refreshToken', expect.any(String));
  })

  test('Should return a null if account with received token is not found', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.refresh('invalid_refreshToken')
    expect(response).toBeNull()
  })

  test('Should call token parse with found account refresh token', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenParseSpy = jest.spyOn(tokenStub, 'parse')
    await sut.refresh('unknown_refreshToken')
    expect(tokenParseSpy.mock.calls[1]).toEqual(['any_refresh_token', expect.any(String)]);
  })

  test('Should return a null if account refreshToken is expired', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse')
      .mockReturnValueOnce(new Promise(resolve => resolve(success({ payload: { id: '' }, expiresIn: 0, createdIn: 0 }))))
      .mockReturnValueOnce(new Promise(resolve => resolve(failure(null))))
    const response = await sut.refresh('any_refreshToken')
    expect(response).toBeNull()
  })

  test('Should return a null if refreshToken received is old', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse')
      .mockReturnValueOnce(new Promise(resolve => resolve(success({ payload: { id: '' }, expiresIn: 0, createdIn: 0 }))))
      .mockReturnValueOnce(new Promise(resolve => resolve(success({ payload: { id: '' }, expiresIn: 1, createdIn: 0 }))))
    const response = await sut.refresh('old_refreshToken')
    expect(response).toBeNull()
  })

  test('Should call token generate with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenGenerateSpy = jest.spyOn(tokenStub, 'generate')
    await sut.refresh('any_refreshToken')
    expect(tokenGenerateSpy).toHaveBeenCalledWith({ id: '' }, expect.objectContaining({
      expiresIn: expect.any(String),
      secretKey: expect.any(String)
    }))
  })

  test('Should return a access token if valid refresh token', async () => {
    const { sut } = makeSut()

    const response = await sut.refresh('valid_refreshToken')
    expect(response).toBe('accessToken')
  })
})
