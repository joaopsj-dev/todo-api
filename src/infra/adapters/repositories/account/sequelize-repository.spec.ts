import { type Account } from '../../../../domain/entities/account';
import AccountModel from '../../../db/sequelize/models/Account';
import { SequelizeAccountRepositoryAdapter } from './sequelize-repository';

const makeFakeCreateAccountData = (): Omit<Account, 'createdAt' | 'updatedAt'> => ({
  id: 'valid_id',
  refreshToken: 'valid_refreshToken',
  accessToken: 'valid_accessToken',
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password'
})

const makeSut = (): SequelizeAccountRepositoryAdapter => {
  return new SequelizeAccountRepositoryAdapter(AccountModel)
}

describe('Account Sequelize Repository', () => {
  test('Should return an account on create method success', async () => {
    const sut = makeSut()

    const account = await sut.create(makeFakeCreateAccountData())

    expect(account).toEqual(expect.objectContaining({
      id: 'valid_id',
      refreshToken: 'valid_refreshToken',
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password',
      updatedAt: expect.any(Date),
      createdAt: expect.any(Date)
    }))
  })

  test('Should return an account with correct email on findByEmail method success', async () => {
    const sut = makeSut()

    await sut.create(makeFakeCreateAccountData())
    const accountByEmail = await sut.findByEmail('valid_email')

    expect(accountByEmail.email).toBe('valid_email')
  })

  test('Should return an account with correct id on findById method success', async () => {
    const sut = makeSut()

    await sut.create(makeFakeCreateAccountData())
    const accountById = await sut.findById('valid_id')

    expect(accountById.id).toBe('valid_id')
  })

  test('Should update and return an account on update method success', async () => {
    const sut = makeSut()

    await sut.create(makeFakeCreateAccountData())
    const updatedAccount = await sut.update(
      { name: 'new_name' },
      'valid_id'
    )

    expect(updatedAccount.name).toBe('new_name')
  })
})
