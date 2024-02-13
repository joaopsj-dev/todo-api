import request from 'supertest'
import app from '../../config/app'
import { JwtTokenAdapter } from '../../../../infra/adapters/token/jwt-token-adapter'
import token_protocols from '../../../../domain/protocols/token'

describe('Account Routes', () => {
  test('AuthMiddleware in PUT /account', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(app)
      .put('/api/account/any_accountId')
      .send({
        name: 'new_name'
      })
      .expect(403)
  }, 30000)

  test('PUT /account', async () => {
    const { text } = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { accessToken } = JSON.parse(text)
    const { response: { payload } } = await new JwtTokenAdapter().parse(accessToken, token_protocols.accessToken_secret_key) as any

    await request(app)
      .put(`/api/account/${payload.id}`)
      .set('x-access-token', accessToken)
      .send({
        name: 'new_name'
      })
      .expect(200)
  }, 30000)

  test('AuthMiddleware in DELETE /account', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(app)
      .delete('/api/account/any_accountId')
      .expect(403)
  }, 30000)

  test('DELETE /account', async () => {
    const { text } = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { accessToken } = JSON.parse(text)
    const { response: { payload } } = await new JwtTokenAdapter().parse(accessToken, token_protocols.accessToken_secret_key) as any

    await request(app)
      .delete(`/api/account/${payload.id}`)
      .set('x-access-token', accessToken)
      .expect(200)
  }, 30000)

  test('AuthMiddleware in GET /account', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    await request(app)
      .get('/api/account/any_accountId')
      .expect(403)
  }, 30000)

  test('GET /account', async () => {
    const { text } = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { accessToken } = JSON.parse(text)
    const { response: { payload } } = await new JwtTokenAdapter().parse(accessToken, token_protocols.accessToken_secret_key) as any

    await request(app)
      .get(`/api/account/${payload.id}`)
      .set('x-access-token', accessToken)
      .expect(200)
  }, 30000)
})
