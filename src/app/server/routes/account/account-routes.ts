/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { expressMiddlewareAdapter } from '../../../../infra/adapters/middleware/express-middleware-adapter'
import { makeAuthMiddleware } from '../../../factories/middlewares/auth-middleware'
import { makeUpdateAccountController } from '../../../factories/account/update-account'
import { makeRemoveAccountController } from '../../../factories/account/remove-account'
import { makeGetAccountController } from '../../../factories/account/get-account'

export default (router: Router): void => {
  const accessAuth = expressMiddlewareAdapter(makeAuthMiddleware())
  router.get('/account/:accountId', accessAuth, expressControllerAdapter(makeGetAccountController()))
  router.put('/account/:accountId', accessAuth, expressControllerAdapter(makeUpdateAccountController()))
  router.delete('/account/:accountId', accessAuth, expressControllerAdapter(makeRemoveAccountController()))
}
