import { type AddAccountData, type Account, type AccountRepository, type Encrypter } from './update-account-protocols'
import { type Success, type Failure } from '../../../protocols/either'
import { UpdateAccount, type UpdateAccountError } from './update-account'

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
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    async findById (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    async update (accountData: Partial<AddAccountData>, accountId: string): Promise<Account> {
      return new Promise(resolve => resolve({
        ...makeFakeAccount(),
        ...accountData
      }))
    }

    create: () => Promise<Account>
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

interface SutTypes {
  sut: UpdateAccount
  accountRepositoryStub: AccountRepository
  encrypterStub: Encrypter
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const encrypterStub = makeEncrypter()
  const sut = new UpdateAccount(accountRepositoryStub, encrypterStub)

  return {
    sut,
    accountRepositoryStub,
    encrypterStub
  }
}

type SuccessByUpdateAccount = Success<null, Account>
type FailureByUpdateAccount = Failure<UpdateAccountError, null>

describe('UpdateAccount usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.update(makeFakeAddAccountData(), 'any_id')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.update(makeFakeAddAccountData(), 'any_id')

    expect(findByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return a failure if account by id not found', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const { error } = await sut.update(makeFakeAddAccountData(), 'invalid_id') as FailureByUpdateAccount

    expect(error.message).toBe('account not found')
  })

  test('Should keep account email if do not receive email to update', async () => {
    const { sut } = makeSut()

    const { response } = await sut.update({
      ...makeFakeAddAccountData(),
      email: null
    }, 'any_id') as SuccessByUpdateAccount

    expect(response.email).toBe('any_email')
  })

  test('Should call findByEmail with correct e-mail', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    await sut.update(makeFakeAddAccountData(), 'any_id')

    expect(findByEmailSpy).toHaveBeenCalledWith('valid_email')
  })

  test('Should return a failure if email is already registered', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise(resolve => resolve({
      ...makeFakeAccount(), id: 'other_id'
    })))
    const { error } = await sut.update({ email: 'any_email' }, 'any_id') as FailureByUpdateAccount

    expect(error.message).toBe('email already exists')
  })

  test('Should update email if is not repeated', async () => {
    const { sut } = makeSut()

    const { response } = await sut.update(makeFakeAddAccountData(), 'any_id') as SuccessByUpdateAccount

    expect(response.email).toBe('valid_email')
  })

  test('Should throw Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()

    jest.spyOn(encrypterStub, 'encrypt').mockRejectedValueOnce(new Error())
    const promise = sut.update(makeFakeAddAccountData(), 'any_id')

    await expect(promise).rejects.toThrow()
  })

  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut()

    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    await sut.update(makeFakeAddAccountData(), 'any_id')

    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should keep account password if do not receive password to update', async () => {
    const { sut } = makeSut()

    const { response } = await sut.update({
      ...makeFakeAddAccountData(),
      password: null
    }, 'any_id') as SuccessByUpdateAccount

    expect(response.password).toBe('any_password')
  })

  test('Should update password if received', async () => {
    const { sut } = makeSut()

    const { response } = await sut.update(makeFakeAddAccountData(), 'any_id') as SuccessByUpdateAccount

    expect(response.password).toBe('hashed_password')
  })

  test('Should keep account name if do not receive name to update', async () => {
    const { sut } = makeSut()

    const { response } = await sut.update({
      ...makeFakeAddAccountData(),
      name: null
    }, 'any_id') as SuccessByUpdateAccount

    expect(response.name).toBe('any_name')
  })

  test('must update name if received', async () => {
    const { sut } = makeSut()

    const { response } = await sut.update(makeFakeAddAccountData(), 'any_id') as SuccessByUpdateAccount

    expect(response.name).toBe('valid_name')
  })

  test('Should call update with correct values', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const updateSpy = jest.spyOn(accountRepositoryStub, 'update')
    await sut.update(makeFakeAddAccountData(), 'any_id')

    expect(updateSpy).toHaveBeenCalledWith({
      ...makeFakeAddAccountData(),
      password: 'hashed_password'
    }, 'any_id')
  })

  test('Should return a account if on success', async () => {
    const { sut } = makeSut()

    const { response: account } = await sut.update(makeFakeAddAccountData(), 'any_id') as SuccessByUpdateAccount

    expect(account).toEqual(expect.objectContaining({
      ...makeFakeAccount(),
      ...makeFakeAddAccountData(),
      password: 'hashed_password'
    }))
  })
})
