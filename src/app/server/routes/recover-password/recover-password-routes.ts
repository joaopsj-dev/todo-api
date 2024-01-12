/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeRecoverPasswordController } from '../../../factories/recover-password'

export default (router: Router): void => {
  router.post('/password/recover', expressControllerAdapter(makeRecoverPasswordController()))
}
