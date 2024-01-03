/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeRefreshTokenController } from '../../../factories/refresh-token'

export default (router: Router): void => {
  router.post('/token/refresh', expressControllerAdapter(makeRefreshTokenController()))
}
