import request from 'supertest'
import app from '../../config/app'
import { JwtTokenAdapter } from '../../../../infra/adapters/token/jwt-token-adapter'
import token_protocols from '../../../../domain/protocols/token'
import TaskModel from '../../../../infra/db/sequelize/models/Task'

describe('Task Routes', () => {
  test('AuthMiddleware in POST /task', async () => {
    await request(app)
      .post('/api/task')
      .send({})
      .expect(403)
  }, 30000)

  test('POST /task', async () => {
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
      .set('x-access-token', accessToken)
      .send({
        name: 'any_name',
        accountId: payload.id,
        isNotify: false
      })
      .expect(200)
  }, 30000)

  test('AuthMiddleware in PUT /task', async () => {
    await request(app)
      .put('/api/task/any_taskId')
      .send({})
      .expect(403)
  }, 30000)

  test('PUT /task', async () => {
    const { text } = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { accessToken } = JSON.parse(text)
    const { response: { payload } } = await new JwtTokenAdapter().parse(accessToken, token_protocols.accessToken_secret_key) as any

    const notifyDate = new Date(Date.now() + 1000 * 60)
    const endDate = new Date(Date.now() + 1000 * 60 * 60)

    const task = await TaskModel.create({
      id: 'any_id',
      accountId: payload.id,
      name: 'any_name',
      description: 'any_description',
      notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth() + 1, day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
      endDate: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
      isNotify: true,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }) as any

    await request(app)
      .put(`/api/task/${task.id}`)
      .set('x-access-token', accessToken)
      .send({
        status: 'concluded',
        isNotify: false
      }).expect(200)
  }, 30000)

  test('AuthMiddleware in DELETE /task', async () => {
    await request(app)
      .delete('/api/task/any_taskId')
      .expect(403)
  }, 30000)

  test('DELETE /task', async () => {
    const { text } = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      })

    const { accessToken } = JSON.parse(text)
    const { response: { payload } } = await new JwtTokenAdapter().parse(accessToken, token_protocols.accessToken_secret_key) as any

    const notifyDate = new Date(Date.now() + 1000 * 60)
    const endDate = new Date(Date.now() + 1000 * 60 * 60)

    const task = await TaskModel.create({
      id: 'any_id',
      accountId: payload.id,
      name: 'any_name',
      description: 'any_description',
      notifyDate: { year: notifyDate.getFullYear(), month: notifyDate.getMonth() + 1, day: notifyDate.getDate(), hour: notifyDate.getHours(), minute: notifyDate.getMinutes() },
      endDate: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate(), hour: endDate.getHours(), minute: endDate.getMinutes() },
      isNotify: true,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }) as any

    await request(app)
      .delete(`/api/task/${task.id}`)
      .set('x-access-token', accessToken)
      .expect(200)
  }, 30000)
})
