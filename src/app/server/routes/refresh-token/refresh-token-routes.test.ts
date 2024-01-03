import request from 'supertest'
import app from '../../config/app'

describe('RefreshToken Routes', () => {
  test('Should return an access token on success', async () => {
    await request(app)
      .post('/api/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const account = await request(app)
      .post('/api/login')
      .send({
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { refreshToken } = JSON.parse(account.text)

    await request(app)
      .post('/api/token/refresh')
      .send({
        refreshToken
      })
      .expect(200)
  }, 30000)
})
