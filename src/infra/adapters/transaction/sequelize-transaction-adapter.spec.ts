import { type TransactionManager, type Transaction } from './sequelize-transaction-adapter-protocols'
import { SequelizeTransactionObjectAdapter, SequelizeTransactionManagerAdapter } from './sequelize-transaction-adapter'
import { sequelize } from '../../db/sequelize/sequelize'
import AccountModel from '../../db/sequelize/models/Account'

const fakeFn = jest.fn().mockResolvedValue('result')

interface SutTypes {
  transactionObject: Transaction
  transactionManager: TransactionManager
}

const makeSut = (): SutTypes => {
  const transactionObject = new SequelizeTransactionObjectAdapter(sequelize)
  const transactionManager = new SequelizeTransactionManagerAdapter(transactionObject)

  return {
    transactionObject,
    transactionManager
  }
}

describe('SequelizeTransactionObjectAdapter', () => {
  test('Should throws if Sequelize throws in beginTransaction method', async () => {
    const { transactionObject } = makeSut()

    jest.spyOn(sequelize, 'transaction').mockRejectedValueOnce(new Error())

    await expect(transactionObject.beginTransaction()).rejects.toThrow()
  })

  test('Should call transaction in beginTransaction method', async () => {
    const { transactionObject } = makeSut()

    const transactionSpy = jest.spyOn(sequelize, 'transaction')
    await transactionObject.beginTransaction()
    await transactionObject.rollback()

    expect(transactionSpy).toHaveBeenCalled()
  })

  test('Should begin transaction', async () => {
    const { transactionObject } = makeSut()

    await transactionObject.beginTransaction();

    expect(transactionObject.getTransaction()).toBeTruthy();
    await transactionObject.rollback()
  })

  test('Should call commit if transaction is not null in commit method', async () => {
    const { transactionObject } = makeSut()

    await transactionObject.beginTransaction()
    const commitSpy = jest.spyOn(transactionObject, 'commit')
    await transactionObject.commit()

    expect(commitSpy).toHaveBeenCalled()
  })

  test('Should throw Error if transaction is null in commit method', async () => {
    const { transactionObject } = makeSut()

    await expect(transactionObject.commit()).rejects.toThrow()
  })

  test('Should rollback transaction', async () => {
    const { transactionObject } = makeSut()

    await transactionObject.beginTransaction();
    await transactionObject.rollback()

    expect(transactionObject.getTransaction()).toBeNull();
  })

  test('Should call rollback if transaction is not null in rollback method', async () => {
    const { transactionObject } = makeSut()

    await transactionObject.beginTransaction()
    const rollbackSpy = jest.spyOn(transactionObject, 'rollback')
    await transactionObject.rollback()

    expect(rollbackSpy).toHaveBeenCalled()
  })

  test('Should throw Error if transaction is null in rollback method', async () => {
    const { transactionObject } = makeSut()

    await expect(transactionObject.rollback()).rejects.toThrow()
  })
})

describe('SequelizeTransactionManagerAdapter', () => {
  test('Should rollback and throw Error on failure', async () => {
    const { transactionManager, transactionObject } = makeSut()

    const fn = jest.fn().mockRejectedValueOnce(new Error())
    const rollbackSpy = jest.spyOn(transactionObject, 'rollback')

    await expect(transactionManager.transaction(fn)).rejects.toThrow()
    expect(rollbackSpy).toHaveBeenCalled()
  })

  test('Should call beginTransaction method', async () => {
    const { transactionObject, transactionManager } = makeSut()

    const beginTransactionSpy = jest.spyOn(transactionObject, 'beginTransaction')
    await transactionManager.transaction(fakeFn)

    expect(beginTransactionSpy).toHaveBeenCalled()
  })

  test('Should call fn', async () => {
    const { transactionManager } = makeSut()

    const fn = fakeFn
    await transactionManager.transaction(fn);

    expect(fn).toHaveBeenCalledWith(expect.any(Object));
  })

  test('Should call commit method on success', async () => {
    const { transactionObject, transactionManager } = makeSut()

    const commitSpy = jest.spyOn(transactionObject, 'commit')
    await transactionManager.transaction(fakeFn)

    expect(commitSpy).toHaveBeenCalled()
  })

  test('Should return fn result on success', async () => {
    const { transactionManager } = makeSut()

    const response = await transactionManager.transaction(fakeFn)

    expect(response).toBe('result')
  })

  test('Should rollback and throw Error on failure', async () => {
    const { transactionManager, transactionObject } = makeSut();

    const rollbackSpy = jest.spyOn(transactionObject, 'rollback');

    try {
      await transactionManager.transaction(async (transaction) => {
        await AccountModel.create({
          id: 'valid_id_1',
          refreshToken: 'valid_refreshToken',
          accessToken: 'valid_accessToken',
          name: 'valid_name',
          email: 'valid_email',
          password: 'valid_password'
        }, { transaction: transaction as any });

        await AccountModel.create({
          id: 'valid_id_2',
          refreshToken: 'valid_refreshToken',
          accessToken: 'valid_accessToken',
          name: 'valid_name',
          email: 'valid_email',
          password: 'valid_password'
        }, { transaction: transaction as any });

        throw new Error();
      });
    } catch (error) {
    }

    const account = await AccountModel.findOne({
      where: { id: 'valid_id_1' }
    });

    expect(rollbackSpy).toHaveBeenCalled()
    expect(account).toBeNull()
  })
})
