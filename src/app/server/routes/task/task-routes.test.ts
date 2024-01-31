import request from 'supertest'
import app from '../../config/app'
import { JwtTokenAdapter } from '../../../../infra/adapters/token/jwt-token-adapter'
import token_protocols from '../../../../domain/protocols/token'

describe('Task Routes', () => {
  test('Should return a 200 on /task post success', async () => {
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
      .post('/api/task')
      .send({
        name: 'any_name',
        accountId: payload.id,
        isNotify: false
      })
      .expect(200)
  }, 30000)
})