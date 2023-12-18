/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-misused-promises */
const dotenv = require('dotenv')
dotenv.config()
import express from 'express'
import { BcryptEncrypterAdapter } from '../../../../infra/adapters/encrypter/bcrypt-encrypter-adapter'
import { SequelizeAccountRepositoryAdapter } from '../../../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../../../infra/adapters/token/jwt-token-adapter'
import { ZodValidatorAdapter } from '../../../../infra/adapters/validator/zod-validator-adapter'
import { accountSchema } from '../../../zod/schemas/account-schema'
import { makeAccountModel } from '../../../../test/sequelize/models/account'
import { expressControllerAdapter } from '../../../../infra/adapters/controller/express-controller-adapter'
import middlewares from '../../config/middlewares'
import { LoginController } from '../../../../presentation/controllers/login/login'
import { Authenticate } from '../../../../domain/usecases/authenticate/authenticate'

const app = express()

const makeLoginController = (): LoginController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(makeAccountModel)
  const encrypter = new BcryptEncrypterAdapter(12)
  const authenticate = new Authenticate(accountRepository, encrypter)
  //
  const loginSchema = accountSchema.pick({ email: true, password: true })
  const validator = new ZodValidatorAdapter(loginSchema)
  //
  const secretKey = process.env.JWT_SECRET_KEY
  const token = new JwtTokenAdapter(secretKey)

  return new LoginController(authenticate, validator, token)
}

middlewares(app)
app.use('/api/login', expressControllerAdapter(makeLoginController()))
export default app
