/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeCreateTaskController } from '../../../factories/create-task'
import { expressMiddlewareAdapter } from '../../../../infra/adapters/middleware/express-middleware-adapter'
import { makeAuthMiddleware } from '../../../factories/middlewares/auth-middleware'

export default (router: Router): void => {
  const accessAuth = expressMiddlewareAdapter(makeAuthMiddleware())
  router.post('/task', accessAuth, expressControllerAdapter(makeCreateTaskController()))
}
