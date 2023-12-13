import { DataTypes, Sequelize } from 'sequelize';
import { SequelizeAccountRepositoryAdapter } from './sequelize-repository';

const makeSequelize = new Sequelize({
  database: 'todo-db',
  username: 'postgres',
  password: 'postgres',
  host: 'localhost',
  dialect: 'postgres'
})

const MakeAccountModel = makeSequelize.define('accounts', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING
});

const makeSut = (): SequelizeAccountRepositoryAdapter => {
  return new SequelizeAccountRepositoryAdapter(MakeAccountModel)
}

describe('Account Sequelize Repository', () => {
  beforeAll(async () => {
    await makeSequelize.authenticate()
  })

  afterAll(async () => {
    await makeSequelize.close()
  })

  afterEach(async () => {
    await MakeAccountModel.destroy({ where: {}, truncate: true })
  })

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
    console.log(accountByEmail);
    expect(accountByEmail.email).toBe('valid_email')
  })
})
