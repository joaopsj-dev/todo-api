/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeLoginController } from '../../../factories/login'
import { makeSignUpController } from '../../../factories/signup'
import { makeRefreshTokenController } from '../../../factories/refresh-token'
import { makeRecoverPasswordController } from '../../../factories/recover-password'
import { makeResetPasswordController } from '../../../factories/reset-password'

export default (router: Router): void => {
  router.post('/auth/signup', expressControllerAdapter(makeSignUpController()))
  router.post('/auth/login', expressControllerAdapter(makeLoginController()))
  router.post('/auth/token/refresh', expressControllerAdapter(makeRefreshTokenController()))
  router.post('/auth/password/recover', expressControllerAdapter(makeRecoverPasswordController()))
  router.post('/auth/password/reset', expressControllerAdapter(makeResetPasswordController()))
}
