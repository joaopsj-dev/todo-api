import AccountModel from '../../../db/sequelize/models/Account';
import { SequelizeAccountRepositoryAdapter } from './sequelize-repository';

const makeSut = (): SequelizeAccountRepositoryAdapter => {
  return new SequelizeAccountRepositoryAdapter(AccountModel)
}

describe('Account Sequelize Repository', () => {
  test('Should return an account on success', async () => {
    const sut = makeSut()
    const account = await sut.create({ id: 'valid_id', refreshToken: 'valid_refreshToken', name: 'valid_name', email: 'valid_email', password: 'valid_password' })

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

  test('Should return an account with correct email', async () => {
    const sut = makeSut()
    await sut.create({ id: 'valid_id', refreshToken: 'valid_refreshToken', name: 'valid_name', email: 'valid_email', password: 'valid_password' })
    const accountByEmail = await sut.findByEmail('valid_email')
    expect(accountByEmail.email).toBe('valid_email')
  })
})
