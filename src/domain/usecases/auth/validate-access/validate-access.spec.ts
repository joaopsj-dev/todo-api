import { type Token, type AccountRepository } from './validate-access-protocols'
import { type Account } from '../../../entities/account'
import { failure, success } from '../../../protocols/either'
import { ValidateAccess } from './validate-access'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_account_refreshToken',
  accessToken: 'any_accessToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findById (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    findByEmail: () => Promise<Account>
    create: () => Promise<Account>
    update: () => Promise<Account>
    delete: (accountId: string) => Promise<void>
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
  sut: ValidateAccess
  accountRepositoryStub: AccountRepository
  tokenStub: Token
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const tokenStub = makeTokenProvider()
  const sut = new ValidateAccess(accountRepositoryStub, tokenStub)

  return {
    sut,
    accountRepositoryStub,
    tokenStub
  }
}

describe('ValidateAccess usecase', () => {
  test('Should throw Token throws', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse').mockRejectedValueOnce(new Error())
    const promise = sut.validate('any_accessToken')

    await expect(promise).rejects.toThrow()
  })

  test('Should call Token parse with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenParseSpy = jest.spyOn(tokenStub, 'parse')
    await sut.validate('any_accessToken')

    expect(tokenParseSpy).toHaveBeenCalledWith('any_accessToken', expect.any(String));
  })

  test('Should return a null if invalid access token', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'parse').mockResolvedValueOnce(failure(null))
    const response = await sut.validate('invalid_accessToken')

    expect(response).toBeNull()
  })

  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.validate('any_accessToken')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.validate('any_accessToken')

    expect(findByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return null if account with received token is not found', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockResolvedValueOnce(null)
    const response = await sut.validate('any_accessToken')

    expect(response).toBeNull()
  })

  test('Should return null if account token is different from received token', async () => {
    const { sut } = makeSut()

    const response = await sut.validate('invalid_accessToken')

    expect(response).toBeNull()
  })

  test('Should return a account if account token is equal to received token', async () => {
    const { sut } = makeSut()

    const response = await sut.validate('any_accessToken')

    expect(response).toEqual(makeFakeAccount())
  })
})
