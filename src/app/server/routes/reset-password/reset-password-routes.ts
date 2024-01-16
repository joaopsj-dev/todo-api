/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeResetPasswordController } from '../../../factories/reset-password'

export default (router: Router): void => {
  router.post('/password/reset', expressControllerAdapter(makeResetPasswordController()))
}
