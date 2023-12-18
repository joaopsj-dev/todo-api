import request from 'supertest'
import { sequelizeTest } from '../../../../test/sequelize/sequelize'
import { makeAccountModel } from '../../../../test/sequelize/models/account'
import app from './make-app'
import signupApp from '../signup/make-app'

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
    await request(signupApp)
      .post('/api/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(app)
      .post('/api/login')
      .send({
        email: 'any_email@mail.com',
        password: 'any_password'
      })
      .expect(200)
  }, 30000)
})
