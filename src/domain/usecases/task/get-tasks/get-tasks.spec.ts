import { type Account } from '../../../entities/account'
import { type Task, type AccountRepository, type TaskRepository } from './get-tasks-protocols'
import { GetTasksFromAccount } from './get-tasks'

const notifyDate = new Date(Date.now() + 1000 * 60)
const endDate = new Date(Date.now() + 1000 * 60 * 60)

const makeFakeAccount = (): Account => ({
  id: 'any_accountId',
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

const makeFakeTask = (): Task => ({
  id: 'any_id',
  accountId: 'any_accountId',
  name: 'any_name',
  description: 'any_description',
  notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth(), day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
  endDate: { year: endDate.getFullYear(), month: endDate.getMonth(), day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
  isNotify: true,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeTaskRepository = (): TaskRepository => {
  class TaskRepositoryStub implements TaskRepository {
    async findAllByAccount (): Promise<Task[]> {
      return new Promise(resolve => resolve([makeFakeTask(), { ...makeFakeTask(), id: 'other_id' }]))
    }

    findById: (taskId: string) => Promise<Task>
    findByIsNotify: () => Promise<Task[]>
    update: (taskData: Partial<Task>, taskId: string) => Promise<Task>
    delete: (taskId: string) => Promise<void>
    create: () => Promise<Task>
    deleteAllFromAccount: (accountId: string) => Promise<void>
  }
  return new TaskRepositoryStub()
}

interface SutTypes {
  sut: GetTasksFromAccount
  accountRepositoryStub: AccountRepository
  taskRepositoryStub: TaskRepository
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const taskRepositoryStub = makeTaskRepository()
  const sut = new GetTasksFromAccount(taskRepositoryStub, accountRepositoryStub)

  return {
    sut,
    accountRepositoryStub,
    taskRepositoryStub
  }
}

describe('GetTasksFromAccount usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.get('any_accountId')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.get('any_accountId')

    expect(findByIdSpy).toHaveBeenCalledWith('any_accountId')
  })

  test('Should return null if account by id not found', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockResolvedValueOnce(null)
    const response = await sut.get('invalid_id')

    expect(response).toBeNull()
  })

  test('Should throw TaskRepository throws', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    jest.spyOn(taskRepositoryStub, 'findAllByAccount').mockRejectedValueOnce(new Error())
    const promise = sut.get('any_accountId')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findAllByAccount with correct id', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(taskRepositoryStub, 'findAllByAccount')
    await sut.get('any_accountId')

    expect(findByIdSpy).toHaveBeenCalledWith('any_accountId')
  })

  test('Should return null if the account id is incorrect', async () => {
    const { sut } = makeSut()

    const response = await sut.get('invalid_id')

    expect(response).toBeNull()
  })

  test('Should return all tasks if valid id provided', async () => {
    const { sut } = makeSut()

    const tasks = await sut.get('any_accountId')

    expect(tasks.length).toEqual(2)
  })
})
