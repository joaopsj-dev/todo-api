import { type Account } from '../../../entities/account'
import { type AccountRepository } from './get-account-protocols'
import { GetAccount } from './get-account'

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

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findById (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    delete: () => Promise<void>
    create: () => Promise<Account>
    update: () => Promise<Account>
    findByEmail: () => Promise<Account>
  }

  return new AccountRepositoryStub()
}

interface SutTypes {
  sut: GetAccount
  accountRepositoryStub: AccountRepository
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const sut = new GetAccount(accountRepositoryStub)

  return {
    sut,
    accountRepositoryStub
  }
}

describe('GetAccount usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.get('any_id')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.get('any_id')

    expect(findByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return null if account by id not found', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.get('invalid_id')

    expect(response).toBeNull()
  })

  test('Should return account dto if geted account', async () => {
    const { sut } = makeSut()

    const response = await sut.get('any_id')

    expect(response).toBeTruthy()
  })
})
