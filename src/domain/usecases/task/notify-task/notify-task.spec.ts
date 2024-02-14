import { type EmailProvider, type AccountRepository, type TaskRepository } from './notify-task-protocols'
import { type Account } from '../../../entities/account'
import { type Task } from '../../../entities/task'
import { NotifyTask } from './notify-task'

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

    update: () => Promise<Account>
    findByEmail: () => Promise<Account>
    create: () => Promise<Account>
    delete: (accountId: string) => Promise<void>
  }
  return new AccountRepositoryStub()
}

const notifyDate = new Date(Date.now() + 1000 * 60)
const endDate = new Date(Date.now() + 1000 * 60 * 60)

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
    async update (): Promise<Task> {
      return new Promise(resolve => resolve(makeFakeTask()))
    }

    async findByIsNotify (): Promise<Task[]> {
      return new Promise(resolve => resolve([makeFakeTask()]))
    }

    findById: (taskId: string) => Promise<Task>
    create: () => Promise<Task>
  }
  return new TaskRepositoryStub()
}

const makeEmailProvider = (): EmailProvider => {
  class EmailProviderStub implements EmailProvider {
    send (): void {
    }
  }

  return new EmailProviderStub()
}

interface SutTypes {
  sut: NotifyTask
  accountRepositoryStub: AccountRepository
  taskRepository: TaskRepository
  emailProviderStub: EmailProvider
}

const makeSut = (): SutTypes => {
  const taskRepository = makeTaskRepository()
  const accountRepositoryStub = makeAccountRepository()
  const emailProviderStub = makeEmailProvider()
  const sut = new NotifyTask(taskRepository, accountRepositoryStub, emailProviderStub)

  return {
    sut,
    accountRepositoryStub,
    taskRepository,
    emailProviderStub
  }
}

describe('NotifyTask usecase', () => {
  test('Should throw TaskRepository throws', async () => {
    const { sut, taskRepository } = makeSut()

    jest.spyOn(taskRepository, 'findByIsNotify').mockRejectedValueOnce(new Error())
    const promise = sut.notify()

    await expect(promise).rejects.toThrow()
  })

  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.notify()

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(accountRepositoryStub, 'findById')
    await sut.notify()

    expect(findByIdSpy).toHaveBeenCalledWith('any_accountId')
  })

  test('Should throw EmailProvider throws', async () => {
    const { sut, emailProviderStub } = makeSut()

    jest.spyOn(emailProviderStub, 'send').mockImplementationOnce(() => { throw new Error() })
    const promise = sut.notify()

    await expect(promise).rejects.toThrow()
  })

  test('Should call EmailProvider send method with correct values', async () => {
    const { sut, emailProviderStub } = makeSut()

    const emailSpy = jest.spyOn(emailProviderStub, 'send')
    await sut.notify()

    expect(emailSpy).toHaveBeenCalledWith(expect.objectContaining({
      to: 'any_email',
      subject: expect.any(String)
    }))
  })

  test('Should call update with correct values', async () => {
    const { sut, taskRepository } = makeSut()

    const update = jest.spyOn(taskRepository, 'update')
    await sut.notify()

    expect(update).toHaveBeenCalledWith({ isNotify: false }, 'any_id')
  })
})
