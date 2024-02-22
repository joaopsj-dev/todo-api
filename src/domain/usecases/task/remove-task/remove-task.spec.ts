import { type Account } from '../../../entities/account'
import { type Task } from '../../../entities/task'
import { type Success, type Failure } from '../../../protocols/either'
import { type AccountRepository, type TaskRepository } from './remove-task-protocols'
import { RemoveTask, type RemoveTaskError } from './remove-task'

const notifyDate = new Date(Date.now() + 1000 * 60)
const endDate = new Date(Date.now() + 1000 * 60 * 60)

const makeFakeAccount = (): Account => ({
  id: 'any_accountId',
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

const makeFakeTask = (): Task => ({
  id: 'any_taskId',
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
    async delete (): Promise<void> {
      return new Promise(resolve => resolve())
    }

    async findById (): Promise<Task> {
      return new Promise(resolve => resolve(makeFakeTask()))
    }

    create: (taskData: Task) => Promise<Task>
    findByIsNotify: () => Promise<Task[]>
    update: (taskData: Partial<Task>, taskId: string) => Promise<Task>
    findAllByAccount: (accountId: string) => Promise<Task[]>
    deleteAllFromAccount: (accountId: string) => Promise<void>
  }
  return new TaskRepositoryStub()
}

interface SutTypes {
  sut: RemoveTask
  accountRepositoryStub: AccountRepository
  taskRepositoryStub: TaskRepository
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const taskRepositoryStub = makeTaskRepository()
  const sut = new RemoveTask(taskRepositoryStub, accountRepositoryStub)

  return {
    sut,
    accountRepositoryStub,
    taskRepositoryStub
  }
}

type SuccessByRemoveTask = Success<null, { message: string }>
type FailureByRemoveTask = Failure<RemoveTaskError, null>

describe('RemoveTask usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.remove('any_taskId', 'any_accountId')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(taskRepositoryStub, 'findById')
    await sut.remove('any_taskId', 'any_accountId')

    expect(findByIdSpy).toHaveBeenCalledWith('any_taskId')
  })

  test('Should return a failure if there is no task with the id provided', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    jest.spyOn(taskRepositoryStub, 'findById').mockResolvedValueOnce(null)
    const { error } = await sut.remove('any_taskId', 'any_accountId') as FailureByRemoveTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'TaskNotFound'
    }))
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.remove('any_taskId', 'any_accountId')

    expect(findByIdSpy).toHaveBeenCalledWith('any_accountId')
  })

  test('Should return a failure if there is no account with the id provided', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockResolvedValueOnce(null)
    const { error } = await sut.remove('any_taskId', 'any_accountId') as FailureByRemoveTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidAccount'
    }))
  })

  test('Should return a failure if the account id is incorrect', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockResolvedValueOnce({
      ...makeFakeAccount(),
      id: 'other_accountId'
    })
    const { error } = await sut.remove('any_taskId', 'other_accountId') as FailureByRemoveTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidAccount'
    }))
  })

  test('Should call delete with correct id', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const deleteSpy = jest.spyOn(taskRepositoryStub, 'delete')
    await sut.remove('any_taskId', 'any_accountId')

    expect(deleteSpy).toHaveBeenCalledWith('any_taskId')
  })

  test('Should return a success on task is deleted', async () => {
    const { sut } = makeSut()

    const { response } = await sut.remove('any_taskId', 'any_accountId') as SuccessByRemoveTask

    expect(response).toStrictEqual(expect.objectContaining({
      message: expect.any(String)
    }))
  })
})
