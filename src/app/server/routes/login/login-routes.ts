/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeLoginController } from '../../../factories/login'

export default (router: Router): void => {
  router.post('/login', expressControllerAdapter(makeLoginController()))
}
