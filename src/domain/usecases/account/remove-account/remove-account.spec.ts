import { type Account } from '../../../entities/account'
import { type AccountRepository, type TaskRepository } from './remove-account-protocols'
import { RemoveAccount } from './remove-account'
import { type Task } from '../../../entities/task'

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

    async delete (accountId: string): Promise<void> {
      return new Promise(resolve => resolve())
    }

    create: () => Promise<Account>
    update: () => Promise<Account>
    findByEmail: () => Promise<Account>
  }

  return new AccountRepositoryStub()
}

const makeTaskRepository = (): TaskRepository => {
  class TaskRepositoryStub implements TaskRepository {
    async deleteAllFromAccount (): Promise<void> {
      return new Promise(resolve => resolve())
    }

    findById: (taskId: string) => Promise<Task>
    findByIsNotify: () => Promise<Task[]>
    update: (taskData: Partial<Task>, taskId: string) => Promise<Task>
    delete: (taskId: string) => Promise<void>
    findAllByAccount: (accountId: string) => Promise<Task[]>
    create: () => Promise<Task>
  }
  return new TaskRepositoryStub()
}

interface SutTypes {
  sut: RemoveAccount
  accountRepositoryStub: AccountRepository
  taskRepositoryStub: TaskRepository
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const taskRepositoryStub = makeTaskRepository()
  const sut = new RemoveAccount(accountRepositoryStub, taskRepositoryStub)

  return {
    sut,
    accountRepositoryStub,
    taskRepositoryStub
  }
}

describe('RemoveAccount usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.remove('any_id')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.remove('any_id')

    expect(findByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return false if account by id not found', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.remove('invalid_id')

    expect(response).toBeFalsy()
  })

  test('Should call delete with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const deleteSpy = jest.spyOn(accountRepositoryStub, 'delete')
    await sut.remove('any_id')

    expect(deleteSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return true if deleted account', async () => {
    const { sut } = makeSut()

    const response = await sut.remove('any_id')

    expect(response).toBeTruthy()
  })

  test('Should call deleteAllFromAccount with correct id', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const deleteSpy = jest.spyOn(taskRepositoryStub, 'deleteAllFromAccount')
    await sut.remove('any_id')

    expect(deleteSpy).toHaveBeenCalledWith('any_id')
  })
})
