/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-misused-promises */
const dotenv = require('dotenv')
dotenv.config()
import express from 'express'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { AddAccount } from '../../domain/usecases/add-account/add-account'
import { BcryptEncrypterAdapter } from '../../infra/adapters/encrypter/bcrypt-encrypter-adapter'
import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../infra/adapters/token/jwt-token-adapter'
import { ZodValidatorAdapter } from '../../infra/adapters/validator/zod-validator-adapter'
import { accountSchema } from '../../app/zod/schemas/account-schema'
import { makeAccountModel } from '../sequelize/models/account'
import { expressControllerAdapter } from '../../infra/adapters/controller/express-controller-adapter'
import middlewares from '../../app/server/config/middlewares'

const app = express()

const makeSignUpController = (): SignUpController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(makeAccountModel)
  const encrypter = new BcryptEncrypterAdapter(12)
  const addAccount = new AddAccount(accountRepository, encrypter)
  //
  const validator = new ZodValidatorAdapter(accountSchema)
  //
  const secretKey = process.env.JWT_SECRET_KEY
  const token = new JwtTokenAdapter(secretKey)

  return new SignUpController(addAccount, validator, token)
}

middlewares(app)
app.use('/api/signup', expressControllerAdapter(makeSignUpController()))
export default app
