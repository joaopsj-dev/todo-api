import request from 'supertest'
import app from '../../config/app'
import { JwtTokenAdapter } from '../../../../infra/adapters/token/jwt-token-adapter'
import token_protocols from '../../../../domain/protocols/token'

describe('ResetPassword Routes', () => {
  test('Should return an access token on success', async () => {
    const { text } = await request(app)
      .post('/api/signup')
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
      .post('/api/password/reset')
      .set('Authorization', `Bearer ${recoverPasswordToken}`)
      .send({
        password: 'any_password'
      })
      .expect(200)
  }, 30000)
})
