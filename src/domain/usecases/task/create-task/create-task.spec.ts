import { type AddTaskData, type AccountRepository, type Task, type TaskRepository } from './create-task-protocols'
import { type Account } from '../../../entities/account'
import { type Success, type Failure } from '../../../protocols/either'
import { CreateTask, type CreateTaskError } from './create-task'

const notifyDate = new Date(Date.now() + 1000 * 60)
const endDate = new Date(Date.now() + 1000 * 60 * 60)

const makeFakeAddTaskData = (): AddTaskData => ({
  accountId: 'any_accountId',
  name: 'any_name',
  description: 'any_description',
  notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth() + 1, day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
  endDate: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
  isNotify: true
})

const makeFakeAccount = (): Account => ({
  id: 'any_id',
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
    async create (): Promise<Task> {
      return new Promise(resolve => resolve(makeFakeTask()))
    }

    findById: (taskId: string) => Promise<Task>
    findByIsNotify: () => Promise<Task[]>
    update: (taskData: Partial<Task>, taskId: string) => Promise<Task>
  }
  return new TaskRepositoryStub()
}

interface SutTypes {
  sut: CreateTask
  accountRepositoryStub: AccountRepository
  taskRepositoryStub: TaskRepository
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const taskRepositoryStub = makeTaskRepository()
  const sut = new CreateTask(accountRepositoryStub, taskRepositoryStub)

  return {
    sut,
    accountRepositoryStub,
    taskRepositoryStub
  }
}

type SuccessByCreateTask = Success<null, Task>
type FailureByCreateTask = Failure<CreateTaskError, null>

describe('CreateTask usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.create(makeFakeAddTaskData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.create(makeFakeAddTaskData())

    expect(findByIdSpy).toHaveBeenCalledWith('any_accountId')
  })

  test('Should return a failure if there is no account with the id provided', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const { error } = await sut.create(makeFakeAddTaskData()) as FailureByCreateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'AccountNotFound'
    }))
  })

  test('Should return a failure if the end date is less than the current date', async () => {
    const { sut } = makeSut()

    const invalidDate = new Date(Date.now() - 1000 * 60 * 60)

    const { error } = await sut.create({
      ...makeFakeAddTaskData(),
      endDate: { year: invalidDate.getFullYear(), month: invalidDate.getMonth(), day: invalidDate.getDate(), hour: invalidDate.getHours(), minute: invalidDate.getMinutes() }
    }) as FailureByCreateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidDateRange'
    }))
  })

  test('Should return a failure if opted for notification without providing end dates or notification', async () => {
    const { sut } = makeSut()

    const { error } = await sut.create({
      ...makeFakeAddTaskData(),
      notifyDate: null
    }) as FailureByCreateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidDateRange'
    }))
  })

  test('Should return a failure if the notification date is after the end date', async () => {
    const { sut } = makeSut()

    const invalidDate = new Date(endDate.getTime() + 1000 * 60 * 60)

    const { error } = await sut.create({
      ...makeFakeAddTaskData(),
      notifyDate: { year: invalidDate.getFullYear(), month: invalidDate.getMonth() + 1, day: invalidDate.getDate(), hour: invalidDate.getHours(), minute: invalidDate.getMinutes() }
    }) as FailureByCreateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidDateRange'
    }))
  })

  test('Should throw TaskRepository throws', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    jest.spyOn(taskRepositoryStub, 'create').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.create(makeFakeAddTaskData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call TaskRepository create with correct values', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const createSpy = jest.spyOn(taskRepositoryStub, 'create')
    await sut.create(makeFakeAddTaskData())

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      ...makeFakeAddTaskData(),
      id: expect.any(String),
      status: 'pending',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })

  test('Should return a task on success', async () => {
    const { sut } = makeSut()

    const { response } = await sut.create(makeFakeAddTaskData()) as SuccessByCreateTask

    expect(response).toStrictEqual(expect.objectContaining({
      ...makeFakeTask(),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })
})
