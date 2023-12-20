import AccountModel from '../../../db/sequelize/models/Account';
import { SequelizeAccountRepositoryAdapter } from './sequelize-repository';

const makeSut = (): SequelizeAccountRepositoryAdapter => {
  return new SequelizeAccountRepositoryAdapter(AccountModel)
}

describe('Account Sequelize Repository', () => {
  test('Should return an account on success', async () => {
    const sut = makeSut()
    const account = await sut.create({ id: 'valid_id', name: 'valid_name', email: 'valid_email', password: 'valid_password' })
    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe('valid_name')
    expect(account.email).toBe('valid_email')
    expect(account.password).toBe('valid_password')
  })

  test('Should return an account with correct email', async () => {
    const sut = makeSut()
    await sut.create({ id: 'valid_id', name: 'valid_name', email: 'valid_email', password: 'valid_password' })
    const accountByEmail = await sut.findByEmail('valid_email')
    expect(accountByEmail.email).toBe('valid_email')
  })
})
