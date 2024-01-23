import { type Account } from '../../../../domain/entities/account';
import { type Task } from '../../../../domain/entities/task';
import AccountModel from '../../../db/sequelize/models/Account';
import TaskModel from '../../../db/sequelize/models/Task';
import { SequelizeTaskRepositoryAdapter } from './sequelize-task-repository';

const makeFakeCreateAccountData = (): Account => ({
  id: 'valid_id',
  refreshToken: 'valid_refreshToken',
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password'
})

const makeFakeCreateTaskData = async (): Promise<Task> => {
  try {
    const { id: accountId } = await AccountModel.create({ ...makeFakeCreateAccountData() }) as any
    const a = {
      id: 'any_id',
      accountId,
      name: 'any_name',
      description: 'any_description',
      notifyDate: new Date(Date.now() + 5000),
      endDate: new Date(Date.now() + 10000),
      isNotify: true,
      status: 'pending',
      notification: 'any_description',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return a as any
  } catch (error) {
  }
}

const makeSut = (): SequelizeTaskRepositoryAdapter => {
  return new SequelizeTaskRepositoryAdapter(TaskModel)
}

describe('Task Sequelize Repository', () => {
  test('Should throws if sequelize create method throws', async () => {
    const sut = makeSut()

    jest.spyOn(TaskModel, 'create').mockRejectedValueOnce(new Error())
    const promise = sut.create(await makeFakeCreateTaskData())

    await expect(promise).rejects.toThrow()
  })

  test('Should return an task on create method success', async () => {
    const sut = makeSut()

    console.log(sut);
    const task = await sut.create(await makeFakeCreateTaskData())

    expect(task).toEqual(expect.objectContaining({
      id: 'any_id',
      accountId: 'valid_id',
      name: 'any_name',
      description: 'any_description',
      notifyDate: expect.any(Date),
      endDate: expect.any(Date),
      isNotify: true,
      status: 'pending',
      notification: 'any_description',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }))
  })
})
