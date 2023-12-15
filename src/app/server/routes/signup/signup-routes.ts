/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import { makeSignUpController } from '../../../factories/signup'

export default (router: Router): void => {
  router.post('/signup', expressControllerAdapter(makeSignUpController()))
}
