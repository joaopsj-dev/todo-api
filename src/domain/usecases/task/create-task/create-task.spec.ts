import { type AddTaskData, type AccountRepository, type EmailProvider, type Scheduler, type Task, type TaskRepository } from './create-task-protocols'
import { type Account } from '../../../entities/account'
import { type Success, type Failure } from '../../../protocols/either'
import { CreateTask, type CreateTaskError } from './create-task'

const makeFakeAddTaskData = (): AddTaskData => ({
  accountId: 'any_accountId',
  name: 'any_name',
  description: 'any_description',
  notifyDate: new Date(Date.now() + 5000),
  endDate: new Date(Date.now() + 10000),
  isNotify: true
})

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_account_refreshToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findById (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    findByEmail: () => Promise<Account>
    create: () => Promise<Account>
    update: () => Promise<Account>
  }
  return new AccountRepositoryStub()
}

const makeFakeTask = (): Task => ({
  id: 'any_id',
  accountId: 'any_accountId',
  name: 'any_name',
  description: 'any_description',
  notifyDate: new Date(Date.now() + 5000),
  endDate: new Date(Date.now() + 10000),
  isNotify: true,
  status: 'pending',
  notification: 'any_description',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeTaskRepository = (): TaskRepository => {
  class TaskRepositoryStub implements TaskRepository {
    async create (): Promise<Task> {
      return new Promise(resolve => resolve(makeFakeTask()))
    }
  }
  return new TaskRepositoryStub()
}

const makeScheduler = (): Scheduler => {
  class SchedulerStub implements Scheduler {
    create (): any {
      return {}
    }

    cancel: (schedule: any) => boolean
  }
  return new SchedulerStub()
}

const makeEmailProvider = (): EmailProvider => {
  class EmailProviderStub implements EmailProvider {
    async send (): Promise<void> {
      return new Promise(resolve => resolve())
    }
  }

  return new EmailProviderStub()
}

interface SutTypes {
  sut: CreateTask
  accountRepositoryStub: AccountRepository
  taskRepositoryStub: TaskRepository
  schedulerStub: Scheduler
  emailProviderStub: EmailProvider
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const taskRepositoryStub = makeTaskRepository()
  const schedulerStub = makeScheduler()
  const emailProviderStub = makeEmailProvider()
  const sut = new CreateTask(accountRepositoryStub, taskRepositoryStub, schedulerStub, emailProviderStub)

  return {
    sut,
    accountRepositoryStub,
    taskRepositoryStub,
    schedulerStub,
    emailProviderStub
  }
}

type SuccessByCreateTask = Success<null, Task>
type FailureByCreateTask = Failure<CreateTaskError, null>

describe('CreateTask usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
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

    const { error } = await sut.create({
      ...makeFakeAddTaskData(),
      endDate: new Date(Date.now() - 1000 * 60 * 60)
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

    const { error } = await sut.create({
      ...makeFakeAddTaskData(),
      notifyDate: new Date(Date.now() + 20000)
    }) as FailureByCreateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidDateRange'
    }))
  })

  test('Should throw Scheduler throws', async () => {
    const { sut, schedulerStub } = makeSut()

    jest.spyOn(schedulerStub, 'create').mockImplementationOnce(() => {
      throw new Error('Mocked scheduler error');
    });
    const promise = sut.create(makeFakeAddTaskData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call scheduler create with correct values', async () => {
    const { sut, schedulerStub } = makeSut()

    const schedulerSpy = jest.spyOn(schedulerStub, 'create').mockImplementationOnce((date, callback) => {
      callback()
      return {}
    })
    const notifyDate = new Date(Date.now() + 5000)
    await sut.create({
      ...makeFakeAddTaskData(),
      notifyDate
    })

    expect(schedulerSpy).toHaveBeenCalledWith(notifyDate, expect.any(Function))
  })

  test('Should call send mail with correct values', async () => {
    const { sut, emailProviderStub, schedulerStub } = makeSut()

    jest.spyOn(schedulerStub, 'create').mockImplementationOnce((date, callback) => {
      callback()
      return {}
    })

    const sendMailSpy = jest.spyOn(emailProviderStub, 'send')
    await sut.create(makeFakeAddTaskData())

    expect(sendMailSpy).toHaveBeenCalledWith(expect.objectContaining({
      to: 'any_email',
      subject: expect.any(String)
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
      notification: {},
      status: 'pending',
      notifyDate: expect.any(Date),
      endDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })

  test('Should return a task on success', async () => {
    const { sut } = makeSut()

    const { response } = await sut.create(makeFakeAddTaskData()) as SuccessByCreateTask

    expect(response).toStrictEqual(expect.objectContaining({
      ...makeFakeTask(),
      notifyDate: expect.any(Date),
      endDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })
})
