/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { expressMiddlewareAdapter } from '../../../../infra/adapters/middleware/express-middleware-adapter'
import { makeAuthMiddleware } from '../../../factories/middlewares/auth-middleware'
import { makeUpdateAccountController } from '../../../factories/account/update-account'

export default (router: Router): void => {
  const accessAuth = expressMiddlewareAdapter(makeAuthMiddleware())
  router.put('/account/:accountId', accessAuth, expressControllerAdapter(makeUpdateAccountController()))
}
