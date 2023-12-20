import request from 'supertest'
import app from '../../config/app'

describe('login Routes', () => {
  test('Should return an access token on success', async () => {
    await request(app)
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
