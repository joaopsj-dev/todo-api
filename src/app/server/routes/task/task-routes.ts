/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeCreateTaskController } from '../../../factories/task/create-task'
import { expressMiddlewareAdapter } from '../../../../infra/adapters/middleware/express-middleware-adapter'
import { makeAuthMiddleware } from '../../../factories/middlewares/auth-middleware'
import { makeUpdateTaskController } from '../../../factories/task/update-task'
import { makeRemoveTaskController } from '../../../factories/task/remove-task'
import { makeGetTasksController } from '../../../factories/task/get-tasks'

export default (router: Router): void => {
  const accessAuth = expressMiddlewareAdapter(makeAuthMiddleware())
  router.post('/task', accessAuth, expressControllerAdapter(makeCreateTaskController()))
  router.put('/task/:taskId', accessAuth, expressControllerAdapter(makeUpdateTaskController()))
  router.delete('/task/:taskId', accessAuth, expressControllerAdapter(makeRemoveTaskController()))
  router.get('/task', accessAuth, expressControllerAdapter(makeGetTasksController()))
}
