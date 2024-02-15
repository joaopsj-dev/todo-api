import { type Task, type TaskRepository } from './update-task-protocols'
import { type Success, type Failure } from '../../../protocols/either'
import { UpdateTask, type UpdateTaskError, type UpdateTaskData } from './update-task'

const notifyDate = new Date(Date.now() + 1000 * 60)
const endDate = new Date(Date.now() + 1000 * 60 * 60)

const makeFakeUpdateTaskData = (): UpdateTaskData => ({
  name: 'new_name',
  description: 'new_description',
  notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth() + 1, day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
  endDate: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
  isNotify: true,
  status: 'concluded'
})

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
    async update (taskData: UpdateTaskData, TaskId: string): Promise<Task> {
      return new Promise(resolve => resolve({
        ...makeFakeTask(),
        ...taskData
      }))
    }

    async findById (): Promise<Task> {
      return new Promise(resolve => resolve(makeFakeTask()))
    }

    create: (taskData: Task) => Promise<Task>
    findByIsNotify: () => Promise<Task[]>
    delete: (taskId: string) => Promise<void>
  }
  return new TaskRepositoryStub()
}

interface SutTypes {
  sut: UpdateTask
  taskRepositoryStub: TaskRepository
}

const makeSut = (): SutTypes => {
  const taskRepositoryStub = makeTaskRepository()
  const sut = new UpdateTask(taskRepositoryStub)

  return {
    sut,
    taskRepositoryStub
  }
}

type SuccessByUpdateTask = Success<null, Task>
type FailureByUpdateTask = Failure<UpdateTaskError, null>

describe('UpdateTask usecase', () => {
  test('Should throw TaskRepository throws', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    jest.spyOn(taskRepositoryStub, 'findById').mockRejectedValueOnce(new Error())
    const promise = sut.update(makeFakeUpdateTaskData(), 'any_id')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findById with correct id', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const findByIdSpy = jest.spyOn(taskRepositoryStub, 'findById')
    await sut.update(makeFakeUpdateTaskData(), 'any_id')

    expect(findByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return a failure if Task by id not found', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    jest.spyOn(taskRepositoryStub, 'findById').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const { error } = await sut.update(makeFakeUpdateTaskData(), 'invalid_id') as FailureByUpdateTask

    expect(error.type).toBe('TaskNotFound')
  })

  test('Should return a failure if the end date is less than the current date', async () => {
    const { sut } = makeSut()

    const invalidDate = new Date(Date.now() - 1000 * 60 * 60)

    const { error } = await sut.update({
      ...makeFakeUpdateTaskData(),
      endDate: { year: invalidDate.getFullYear(), month: invalidDate.getMonth(), day: invalidDate.getDate(), hour: invalidDate.getHours(), minute: invalidDate.getMinutes() }
    }, 'any_id') as FailureByUpdateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidDateRange'
    }))
  })

  test('Should return a failure if opted for notification without providing end dates or notification', async () => {
    const { sut } = makeSut()

    const { error } = await sut.update({
      ...makeFakeUpdateTaskData(),
      notifyDate: null
    }, 'any_id') as FailureByUpdateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidDateRange'
    }))
  })

  test('Should return a failure if the notification date is after the end date', async () => {
    const { sut } = makeSut()

    const invalidDate = new Date(endDate.getTime() + 1000 * 60 * 60)

    const { error } = await sut.update({
      ...makeFakeUpdateTaskData(),
      notifyDate: { year: invalidDate.getFullYear(), month: invalidDate.getMonth() + 1, day: invalidDate.getDate(), hour: invalidDate.getHours(), minute: invalidDate.getMinutes() }
    }, 'any_id') as FailureByUpdateTask

    expect(error).toStrictEqual(expect.objectContaining({
      message: expect.any(String),
      type: 'InvalidDateRange'
    }))
  })

  test('Should keep Task data if do not receive data to update', async () => {
    const { sut } = makeSut()

    const { response: updatedTask } = await sut.update({ }, 'any_id') as SuccessByUpdateTask

    expect(updatedTask).toStrictEqual({
      ...makeFakeTask(),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    })
  })

  test('Should update task with the received data', async () => {
    const { sut } = makeSut()

    const { response: updatedTask } = await sut.update(makeFakeUpdateTaskData(), 'any_id') as SuccessByUpdateTask

    expect(updatedTask).toStrictEqual({
      ...makeFakeTask(),
      ...makeFakeUpdateTaskData(),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    })
  })

  test('Should call update with current values if you do not receive data to update', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const updateSpy = jest.spyOn(taskRepositoryStub, 'update')
    await sut.update({}, 'any_id')

    const { name, description, notifyDate, endDate, isNotify, status } = makeFakeTask()

    expect(updateSpy).toHaveBeenCalledWith({
      name,
      description,
      notifyDate,
      endDate,
      isNotify,
      status
    }, 'any_id')
  })

  test('Should call update with correct values', async () => {
    const { sut, taskRepositoryStub } = makeSut()

    const updateSpy = jest.spyOn(taskRepositoryStub, 'update')
    await sut.update(makeFakeUpdateTaskData(), 'any_id')

    expect(updateSpy).toHaveBeenCalledWith({
      ...makeFakeUpdateTaskData()
    }, 'any_id')
  })

  test('Should return a Task on success', async () => {
    const { sut } = makeSut()

    const { response: Task } = await sut.update(makeFakeUpdateTaskData(), 'any_id') as SuccessByUpdateTask

    expect(Task).toStrictEqual(expect.objectContaining({
      ...makeFakeTask(),
      ...makeFakeUpdateTaskData(),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })
})
