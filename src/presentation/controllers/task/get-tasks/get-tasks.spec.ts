import { type HttpRequest, type GetTasksFromAccount } from './get-tasks-protocols'
import { type Task } from '../../../../domain/entities/task'
import { ok, serverError, unauthorized } from '../../../helpers/http-helper'
import { GetTasksController } from './get-tasks'

const makeFakeRequest = (): HttpRequest => ({
  accountId: 'any_id'
})

const notifyDate = new Date(Date.now() + 1000 * 60)
const endDate = new Date(Date.now() + 1000 * 60 * 60)

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

const makeGetTasksFromAccount = (): GetTasksFromAccount => {
  class GetTasksFromAccountStub {
    async get (): Promise<Task[]> {
      return new Promise(resolve => resolve([makeFakeTask()]))
    }
  }
  return new GetTasksFromAccountStub() as unknown as GetTasksFromAccount
}

interface SutTypes {
  sut: GetTasksController
  getTasksFromAccountStub: GetTasksFromAccount
}

const makeSut = (): SutTypes => {
  const getTasksFromAccountStub = makeGetTasksFromAccount()
  const sut = new GetTasksController(getTasksFromAccountStub)

  return {
    sut,
    getTasksFromAccountStub
  }
}

describe('GetTasksController', () => {
  test('Should return 500 if GetTasksFromAccount throws', async () => {
    const { sut, getTasksFromAccountStub } = makeSut()

    jest.spyOn(getTasksFromAccountStub, 'get').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError())
  })

  test('Should call GetTasksFromAccountStub with correct values', async () => {
    const { sut, getTasksFromAccountStub } = makeSut()

    const getSpy = jest.spyOn(getTasksFromAccountStub, 'get')
    await sut.handle(makeFakeRequest())

    expect(getSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return 401 if invalid account', async () => {
    const { sut, getTasksFromAccountStub } = makeSut()

    jest.spyOn(getTasksFromAccountStub, 'get').mockResolvedValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized({ message: expect.any(String) }))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok([expect.objectContaining({ ...makeFakeTask(), createdAt: expect.any(Date), updatedAt: expect.any(Date) })]))
  })
})
