import { type Encrypter, type Account, type AccountRepository } from './reset-password-protocols'
import { ResetPassword } from './reset-password'

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

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findById (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    async update (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    findByEmail: (id: string) => Promise<Account>
    create: (accountData: Omit<Account, 'createdAt' | 'updatedAt'>) => Promise<Account>
  }
  return new AccountRepositoryStub()
}

const makeEncrypter = (): Encrypter => {
  class EncryptStub implements Encrypter {
    async encrypt (): Promise<string> {
      return new Promise(resolve => resolve('hashed_password'))
    }

    parse: () => Promise<boolean>
  }
  return new EncryptStub()
}

interface SutTypes {
  sut: ResetPassword
  accountRepositoryStub: AccountRepository
  encrypterStub: Encrypter
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const encrypterStub = makeEncrypter()
  const sut = new ResetPassword(accountRepositoryStub, encrypterStub)

  return {
    sut,
    accountRepositoryStub,
    encrypterStub
  }
}

describe('ResetPassword usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.reset({ password: 'valid_password', accountId: 'valid_id' })

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.reset({ password: 'valid_password', accountId: 'valid_id' })

    expect(findByIdSpy).toHaveBeenCalledWith('valid_id')
  })

  test('Should return a null if there is no user with the id provided', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.reset({ password: 'valid_password', accountId: 'invalid_id' })

    expect(response).toBeNull()
  })

  test('Should throw Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()

    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.reset({ password: 'valid_password', accountId: 'valid_id' })

    await expect(promise).rejects.toThrow()
  })

  test('Should call encrypt with correct password', async () => {
    const { sut, encrypterStub } = makeSut()

    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    await sut.reset({ password: 'valid_password', accountId: 'valid_id' })

    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should call update with correct values', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const updateSpy = jest.spyOn(accountRepositoryStub, 'update')
    await sut.reset({ password: 'valid_password', accountId: 'valid_id' })

    expect(updateSpy).toHaveBeenCalledWith({ password: 'hashed_password' }, 'valid_id')
  })

  test('Should return a updated account on success', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'update').mockImplementationOnce(async ({ password }) => ({
      ...makeFakeAccount(),
      password
    }));
    const response = await sut.reset({ password: 'valid_password', accountId: 'valid_id' })

    expect(response.password).toBe('hashed_password')
  })
})
