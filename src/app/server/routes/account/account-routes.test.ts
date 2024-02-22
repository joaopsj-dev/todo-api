import request from 'supertest'
import app from '../../config/app'

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
      .put('/api/account')
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

    await request(app)
      .put('/api/account')
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
      .delete('/api/account')
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

    await request(app)
      .delete('/api/account')
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
      .get('/api/account')
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

    await request(app)
      .get('/api/account')
      .set('x-access-token', accessToken)
      .expect(200)
  }, 30000)
})
