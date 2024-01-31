/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeCreateTaskController } from '../../../factories/create-task'

export default (router: Router): void => {
  router.post('/task', expressControllerAdapter(makeCreateTaskController()))
}
