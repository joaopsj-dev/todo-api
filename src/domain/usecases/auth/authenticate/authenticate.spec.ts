import { Authenticate, type Account, type AccountRepository, type AuthenticateError, type Encrypter, type Token, type ParseTokenError, type TokenPayload } from './authenticate-protocols'
import { type Either, type Failure, type Success } from '../../../protocols/either'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_refresh_token',
  accessToken: 'any_accessToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeFakeAuthenticateData = (): { email: string, password: string } => ({
  email: 'valid_email',
  password: 'valid_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findByEmail (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    async update (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    findById: (id: string) => Promise<Account>
    create: (accountData: Omit<Account, 'createdAt' | 'updatedAt'>) => Promise<Account>
  }
  return new AccountRepositoryStub()
}

const makeEncrypter = (): Encrypter => {
  class EncryptStub implements Encrypter {
    async parse (data: string, encrypted: string): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }

    encrypt: (data: string) => Promise<string>
  }
  return new EncryptStub()
}

const makeTokenProvider = (): Token => {
  class TokenProviderStub implements Token {
    async generate (): Promise<string> {
      return new Promise(resolve => resolve('token'))
    }

    parse: (token: string, secretKey: string) => Promise<Either<ParseTokenError, TokenPayload>>
  }
  return new TokenProviderStub()
}

interface SutTypes {
  sut: Authenticate
  accountRepositoryStub: AccountRepository
  encrypterStub: Encrypter
  tokenStub: Token
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const encrypterStub = makeEncrypter()
  const tokenStub = makeTokenProvider()
  const sut = new Authenticate(accountRepositoryStub, encrypterStub, tokenStub)

  return {
    sut,
    accountRepositoryStub,
    encrypterStub,
    tokenStub
  }
}

type SuccessByAuthenticate = Success<null, Account>
type FailureByAuthenticate = Failure<AuthenticateError, null>

describe('Authenticate UseCase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeFakeAuthenticateData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call findByEmail with correct e-mail', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    await sut.auth(makeFakeAuthenticateData())

    expect(findByEmailSpy).toHaveBeenCalledWith('valid_email')
  })

  test('Should return a failure if there is no user with the email provided', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.auth(makeFakeAuthenticateData()) as FailureByAuthenticate

    expect(response.error.message).toStrictEqual(expect.any(String))
  })

  test('Should throw Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()

    jest.spyOn(encrypterStub, 'parse').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeFakeAuthenticateData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call Encrypter parse method with correct password', async () => {
    const { sut, encrypterStub } = makeSut()

    const encryptSpy = jest.spyOn(encrypterStub, 'parse')
    await sut.auth(makeFakeAuthenticateData())

    expect(encryptSpy).toHaveBeenCalledWith('valid_password', 'any_password')
  })

  test('Should return a failure if incorrect password', async () => {
    const { sut, encrypterStub } = makeSut()

    jest.spyOn(encrypterStub, 'parse').mockReturnValueOnce(new Promise(resolve => resolve(false)))
    const response = await sut.auth(makeFakeAuthenticateData()) as FailureByAuthenticate

    expect(response.error.message).toStrictEqual(expect.any(String))
  })

  test('Should throw Token throws', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'generate').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeFakeAuthenticateData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call Token generate method with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenSpy = jest.spyOn(tokenStub, 'generate')
    await sut.auth(makeFakeAuthenticateData())

    expect(tokenSpy).toHaveBeenCalledTimes(2)
    expect(tokenSpy).toHaveBeenCalledWith({ id: 'any_id' }, expect.objectContaining({
      expiresIn: expect.any(String),
      secretKey: expect.any(String)
    }))
  })

  test('Should call AccountRepository update method with correct values', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const updateSpy = jest.spyOn(accountRepositoryStub, 'update')
    await sut.auth(makeFakeAuthenticateData())

    expect(updateSpy).toHaveBeenCalledWith({ accessToken: 'token', refreshToken: 'token' }, 'any_id')
  })

  test('Should update account refresh token', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'update').mockImplementationOnce(async ({ accessToken, refreshToken }) => ({
      ...makeFakeAccount(),
      accessToken,
      refreshToken
    }));
    const { response: account } = await sut.auth(makeFakeAuthenticateData()) as SuccessByAuthenticate

    expect(account.accessToken).toBe('token')
    expect(account.refreshToken).toBe('token')
  })

  test('Should return a account if on success', async () => {
    const { sut } = makeSut()

    const { response: account } = await sut.auth(makeFakeAuthenticateData()) as SuccessByAuthenticate

    expect(account).toEqual(expect.objectContaining({
      ...makeFakeAccount(),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })
})
