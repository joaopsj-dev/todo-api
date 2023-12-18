import request from 'supertest'
import { sequelizeTest } from '../../../../test/sequelize/sequelize'
import { makeAccountModel } from '../../../../test/sequelize/models/account'
import loginAppStub from '../../../../test/app-stub/login'
import signupAppStub from '../../../../test/app-stub/signup'

describe('login Routes', () => {
  beforeAll(async () => {
    await sequelizeTest.authenticate()
  })

  afterAll(async () => {
    await sequelizeTest.close()
  })

  afterEach(async () => {
    await makeAccountModel.destroy({ where: {}, truncate: true })
  })

  test('Should return an access token on success', async () => {
    await request(signupAppStub)
      .post('/api/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(loginAppStub)
      .post('/api/login')
      .send({
        email: 'any_email@mail.com',
        password: 'any_password'
      })
      .expect(200)
  }, 30000)
})
