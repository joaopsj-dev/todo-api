import { type Token, type AccountRepository } from './refresh-token-protocols'
import { type AddAccountData, type Account } from '../../../entities/account'
import { RefreshToken } from './refresh-token'
import { failure, success } from '../../../protocols/either'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_account_refreshToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findById (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    findByEmail: (email: string) => Promise<Account>
    create: (accountData: Account) => Promise<Account>
    update: (accountData: Partial<AddAccountData>, accountId: string) => Promise<Account>
  }
  return new AccountRepositoryStub()
}

const makeTokenProvider = (): Token => {
  class TokenProviderStub implements Token {
    async generate (): Promise<string> {
      return new Promise(resolve => resolve('accessToken'))
    }

    async parse (): Promise<any> {
      return new Promise(resolve => resolve(success({ payload: { id: 'any_id' }, expiresIn: 0, createdIn: 0 })))
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

describe('RefreshToken UseCase', () => {
  test('Should throw Token throws', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.refresh('any_refreshToken')

    await expect(promise).rejects.toThrow()
  })

  test('Should call Token parse with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenParseSpy = jest.spyOn(tokenStub, 'parse')
    await sut.refresh('any_refreshToken')

    expect(tokenParseSpy).toHaveBeenCalledWith('any_refreshToken', expect.any(String));
  })

  test('Should return a null if invalid refreshToken', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse').mockReturnValueOnce(new Promise(resolve => resolve(failure(null))))
    const response = await sut.refresh('invalid_refreshToken')

    expect(response).toBeNull()
  })

  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.refresh('any_refreshToken')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct payload', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.refresh('any_refreshToken')

    expect(findByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return a null if account with received token is not found', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.refresh('invalid_refreshToken')

    expect(response).toBeNull()
  })

  test('Should call Token parse with found account refresh token', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenParseSpy = jest.spyOn(tokenStub, 'parse')
    await sut.refresh('any_refreshToken')

    expect(tokenParseSpy.mock.calls[1]).toEqual(['any_account_refreshToken', expect.any(String)]);
  })

  test('Should return a null if account refreshToken is expired', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse')
      .mockReturnValueOnce(new Promise(resolve => resolve(success({ payload: { id: 'any_id' }, expiresIn: 0, createdIn: 0 }))))
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

  test('Should call tToken generate with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenGenerateSpy = jest.spyOn(tokenStub, 'generate')
    await sut.refresh('any_refreshToken')

    expect(tokenGenerateSpy).toHaveBeenCalledWith({ id: 'any_id' }, expect.objectContaining({
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
