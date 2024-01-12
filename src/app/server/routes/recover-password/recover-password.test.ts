import request from 'supertest'
import app from '../../config/app'

describe('RecoverPassword Routes', () => {
  test('Should return an access token on success', async () => {
    await request(app)
      .post('/api/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(app)
      .post('/api/password/recover')
      .send({
        email: 'any_email@mail.com'
      })
      .expect(200)
  }, 30000)
})
