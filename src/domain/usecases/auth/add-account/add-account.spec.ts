import { type Encrypter, type Account, type AccountRepository, type AddAccountData, type Token } from './add-account-protocols'
import { AddAccount } from './add-account'

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

const makeFakeAddAccountData = (): AddAccountData => ({
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findByEmail (): Promise<Account> {
      return new Promise(resolve => resolve(null))
    }

    async create (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    findById: (id: string) => Promise<Account>
    update: (accountData: Partial<AddAccountData>, accountId: string) => Promise<Account>
  }

  return new AccountRepositoryStub()
}

const makeEncrypter = (): Encrypter => {
  class EncryptStub implements Encrypter {
    async encrypt (data: string): Promise<string> {
      return new Promise(resolve => resolve('hashed_password'))
    }

    parse: (data: string, encrypted: string) => Promise<boolean>
  }

  return new EncryptStub()
}

const makeTokenProvider = (): Token => {
  class TokenProviderStub implements Token {
    async generate (): Promise<string> {
      return new Promise(resolve => resolve('token'))
    }

    async parse (): Promise<any> {
      return new Promise(resolve => resolve(null))
    }
  }
  return new TokenProviderStub()
}

interface SutTypes {
  sut: AddAccount
  accountRepositoryStub: AccountRepository
  encrypterStub: Encrypter
  tokenStub: Token
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const encrypterStub = makeEncrypter()
  const tokenStub = makeTokenProvider()
  const sut = new AddAccount(accountRepositoryStub, encrypterStub, tokenStub)

  return {
    sut,
    accountRepositoryStub,
    encrypterStub,
    tokenStub
  }
}

describe('AddAccount UseCase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.add(makeFakeAddAccountData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call findByEmail with correct e-mail', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    await sut.add(makeFakeAddAccountData())

    expect(findByEmailSpy).toHaveBeenCalledWith('valid_email')
  })

  test('Should return a null if the email is already registered', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeAccount())))
    const response = await sut.add(makeFakeAddAccountData())

    expect(response).toBeNull()
  })

  test('Should throw Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()

    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.add(makeFakeAddAccountData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut()

    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    await sut.add(makeFakeAddAccountData())

    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw Token throws', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'generate').mockRejectedValueOnce(new Error())
    const promise = sut.add(makeFakeAddAccountData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call Token with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const generateSpy = jest.spyOn(tokenStub, 'generate')
    await sut.add(makeFakeAddAccountData())

    expect(generateSpy).toHaveBeenCalledWith({ id: expect.any(String) }, {
      expiresIn: expect.any(String),
      secretKey: expect.any(String)
    })
  })

  test('Should call AccountRepository create with correct values', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const createSpy = jest.spyOn(accountRepositoryStub, 'create')
    await sut.add(makeFakeAddAccountData())

    expect(createSpy).toHaveBeenCalledWith({
      id: expect.any(String),
      refreshToken: 'token',
      accessToken: 'token',
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    })
  })

  test('Should return a account if on success', async () => {
    const { sut } = makeSut()

    const account = await sut.add(makeFakeAddAccountData())

    expect(account).toEqual(expect.objectContaining({
      ...makeFakeAccount(),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })
})
