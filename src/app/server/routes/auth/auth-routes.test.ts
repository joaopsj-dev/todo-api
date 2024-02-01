import request from 'supertest'
import app from '../../config/app'
import { JwtTokenAdapter } from '../../../../infra/adapters/token/jwt-token-adapter'
import token_protocols from '../../../../domain/protocols/token'

describe('Auth Routes', () => {
  test('Should return a 200 on signup success', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })
      .expect(200)
  }, 30000)

  test('Should return a 200 on login success', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'any_email@mail.com',
        password: 'any_password'
      })
      .expect(200)
  }, 30000)

  test('Should return a 200 on refresh token success', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const account = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { refreshToken } = JSON.parse(account.text)

    await request(app)
      .post('/api/auth/token/refresh')
      .send({
        refreshToken
      })
      .expect(200)
  }, 30000)

  test('Should return an 200 on recover password success', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(app)
      .post('/api/auth/password/recover')
      .send({
        email: 'any_email@mail.com'
      })
      .expect(200)
  }, 30000)

  test('Should return a 200 on success', async () => {
    const { text } = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { accessToken } = JSON.parse(text)
    const { response: { payload } } = await new JwtTokenAdapter().parse(accessToken, token_protocols.accessToken_secret_key) as any

    const recoverPasswordToken = await new JwtTokenAdapter().generate({ id: payload.id }, {
      secretKey: token_protocols.recoverToken_secret_key,
      expiresIn: token_protocols.recover_token_expires_in
    })

    await request(app)
      .post('/api/auth/password/reset')
      .set('x-recover-password-token', recoverPasswordToken)
      .send({
        password: 'any_password'
      })
      .expect(200)
  }, 30000)
})
