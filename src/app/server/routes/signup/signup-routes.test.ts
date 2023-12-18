import request from 'supertest'
import { sequelizeTest } from '../../../../test/sequelize/sequelize'
import { makeAccountModel } from '../../../../test/sequelize/models/account'
import signupAppStub from '../../../../test/app-stub/signup'

describe('SignUp Routes', () => {
  beforeAll(async () => {
    await sequelizeTest.authenticate()
  })

  afterAll(async () => {
    await sequelizeTest.close()
  })

  afterEach(async () => {
    await makeAccountModel.destroy({ where: {}, truncate: true })
  })

  test('Should return an account on success', async () => {
    await request(signupAppStub)
      .post('/api/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })
      .expect(200)
  }, 30000)
})
