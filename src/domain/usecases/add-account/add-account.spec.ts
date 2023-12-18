import { AddAccount } from './add-account'
import { type Encrypter, type Account, type AccountRepository, type AddAccountData } from './add-account-protocols'

const makeFakeAccount = (): Account => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email',
  password: 'hashed_password'
})

const makeFakeAddAccountData = (): AddAccountData => ({
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findByEmail (email: string): Promise<Account> {
      return new Promise(resolve => resolve(null))
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
  sut: AddAccount
  accountRepositoryStub: AccountRepository
  encrypterStub: Encrypter
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const encrypterStub = makeEncrypter()
  const sut = new AddAccount(accountRepositoryStub, encrypterStub)

  return {
    sut,
    accountRepositoryStub,
    encrypterStub
  }
}

describe('AddAccount UseCase', () => {
  test('Should return an error if the email is already registered', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeAccount())))
    const response = await sut.add(makeFakeAddAccountData())
    expect(response).toBeNull()
  })

  test('Should call findByEmail with correct e-mail', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    await sut.add(makeFakeAddAccountData())
    expect(findByEmailSpy).toHaveBeenCalledWith('valid_email')
  })

  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.add(makeFakeAddAccountData())
    await expect(promise).rejects.toThrow()
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

  test('Should call AccountRepository Create with correct values', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const createSpy = jest.spyOn(accountRepositoryStub, 'create')
    await sut.add(makeFakeAccount())
    expect(createSpy).toHaveBeenCalledWith(makeFakeAccount())
  })

  test('Should return an account if on success', async () => {
    const { sut } = makeSut()
    const account = await sut.add(makeFakeAddAccountData())
    expect(account).toEqual(makeFakeAccount())
  })
})
