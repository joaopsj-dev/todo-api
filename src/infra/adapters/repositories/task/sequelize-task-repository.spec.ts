import { type Account } from '../../../../domain/entities/account';
import { type Task } from '../../../../domain/entities/task';
import AccountModel from '../../../db/sequelize/models/Account';
import TaskModel from '../../../db/sequelize/models/Task';
import { SequelizeTaskRepositoryAdapter } from './sequelize-task-repository';

const notifyDate = new Date(Date.now() + 5000)
const endDate = new Date(Date.now() + 10000)

const makeFakeCreateAccountData = (): Account => ({
  id: 'valid_id',
  refreshToken: 'valid_refreshToken',
  accessToken: 'valid_accessToken',
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeFakeCreateTaskData = (): Task => ({
  id: 'any_id',
  accountId: 'valid_id',
  name: 'any_name',
  description: 'any_description',
  notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth() + 1, day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
  endDate: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
  isNotify: true,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
})

const makeSut = (): SequelizeTaskRepositoryAdapter => {
  return new SequelizeTaskRepositoryAdapter(TaskModel)
}

describe('Task Sequelize Repository', () => {
  beforeEach(async () => {
    await AccountModel.create({ ...makeFakeCreateAccountData() })
  })

  test('Should throws if sequelize throws', async () => {
    const sut = makeSut()

    jest.spyOn(TaskModel, 'create').mockRejectedValueOnce(new Error())
    const promise = sut.create(makeFakeCreateTaskData())

    await expect(promise).rejects.toThrow()
  })

  test('Should return an task on create method success', async () => {
    const sut = makeSut()

    const createTaskData = makeFakeCreateTaskData()
    const task = await sut.create(createTaskData)

    expect(task).toEqual(expect.objectContaining({
      ...createTaskData,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })

  test('Should return all tasks that need to be notified', async () => {
    const sut = makeSut()

    const createTaskData = makeFakeCreateTaskData()
    await sut.create(createTaskData)
    await sut.create({
      ...createTaskData,
      id: 'any_id_2',
      isNotify: false
    })
    await sut.create({
      ...createTaskData,
      id: 'any_id_3',
      notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth() + 1, day: notifyDate.getDate() + 1, hour: notifyDate.getHours(), minute: notifyDate.getMinutes() }
    })

    const tasksByIsNotify = await sut.findByIsNotify()

    expect(tasksByIsNotify.length).toBe(1)
    tasksByIsNotify.forEach(task => {
      expect(task.isNotify).toBe(true)
    })
  })

  test('Should update and return an task on update method success', async () => {
    const sut = makeSut()

    await sut.create(makeFakeCreateTaskData())
    const updatedTask = await sut.update(
      { name: 'new_name' },
      'any_id'
    )

    expect(updatedTask.name).toBe('new_name')
  })

  test('Should return a task on findById method success', async () => {
    const sut = makeSut()

    await sut.create(makeFakeCreateTaskData())
    const taskById = await sut.findById('any_id')

    expect(taskById.id).toBe('any_id')
  })

  test('Should remove the task on delete method success', async () => {
    const sut = makeSut()

    await sut.create(makeFakeCreateTaskData())
    await sut.delete('any_id')
    const taskById = await sut.findById('any_id')

    expect(taskById).toBeNull()
  })

  test('Should return all tasks by account', async () => {
    const sut = makeSut()

    await sut.create(makeFakeCreateTaskData())
    await sut.create({ ...makeFakeCreateTaskData(), id: 'other_id' })
    const tasksByAccount = await sut.findAllByAccount('valid_id')

    expect(tasksByAccount.length).toBe(2)
    tasksByAccount.forEach(task => expect(task.accountId).toBe('valid_id'))
  })
})
