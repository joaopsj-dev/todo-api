import { type Failure, type Success } from '../../protocols/either'
import { type Account, type AccountRepository, Authenticate, type AuthenticateError, type Encrypter } from './authenticate-protocols'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email',
  password: 'hashed_password'
})

const makeFakeAuthenticateData = (): { email: string, password: string } => ({
  email: 'any_email',
  password: 'any_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findByEmail (email: string): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    async create (accountData: Account): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }
  return new AccountRepositoryStub()
}

const makeEncrypter = (): Encrypter => {
  class EncryptStub implements Encrypter {
    async encrypt (data: string): Promise<string> {
      return new Promise(resolve => resolve('hashed_password'))
    }

    async parse (data: string, encrypted: string): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }
  }
  return new EncryptStub()
}

interface SutTypes {
  sut: Authenticate
  accountRepositoryStub: AccountRepository
  encrypterStub: Encrypter
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const encrypterStub = makeEncrypter()
  const sut = new Authenticate(accountRepositoryStub, encrypterStub)

  return {
    sut,
    accountRepositoryStub,
    encrypterStub
  }
}

type SuccessByAuthenticate = Success<null, Account>
type FailureByAuthenticate = Failure<AuthenticateError, null>

describe('Authenticate UseCase', () => {
  test('Should return a correct error if there is no user with the email provided', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.auth(makeFakeAuthenticateData()) as FailureByAuthenticate
    expect(response.error.message).toBe('user not found')
  })

  test('Should return a correct error if incorrect password', async () => {
    const { sut, encrypterStub } = makeSut()

    jest.spyOn(encrypterStub, 'parse').mockReturnValueOnce(new Promise(resolve => resolve(false)))
    const response = await sut.auth(makeFakeAuthenticateData()) as FailureByAuthenticate
    expect(response.error.message).toBe('incorrect password')
  })

  test('Should call findByEmail with correct e-mail', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    await sut.auth(makeFakeAuthenticateData())
    expect(findByEmailSpy).toHaveBeenCalledWith('any_email')
  })

  test('Should call Encrypter parse method with correct password', async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'parse')
    await sut.auth(makeFakeAuthenticateData())
    expect(encryptSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
  })

  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeFakeAuthenticateData())
    await expect(promise).rejects.toThrow()
  })

  test('Should throw Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'parse').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeFakeAuthenticateData())
    await expect(promise).rejects.toThrow()
  })

  test('Should return an account if on success', async () => {
    const { sut } = makeSut()
    const { response: account } = await sut.auth(makeFakeAuthenticateData()) as SuccessByAuthenticate
    expect(account).toEqual(makeFakeAccount())
  })
})
