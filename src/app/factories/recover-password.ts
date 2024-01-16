import { SequelizeAccountRepositoryAdapter } from '../../infra/adapters/repositories/account/sequelize-repository'
import { JwtTokenAdapter } from '../../infra/adapters/token/jwt-token-adapter'
import AccountModel from '../../infra/db/sequelize/models/Account'
import { ZodValidatorAdapter } from '../../infra/adapters/validator/zod-validator-adapter'
import { RecoverPasswordController } from '../../presentation/controllers/auth/recover-password/recover-password'
import { SendRecoverEmail } from '../../domain/usecases/auth/send-recover-email/send-recover-email'
import { NodeMailerEmailAdapter } from '../../infra/adapters/email/nodemailer-email-adapter'
import { accountSchema } from '../zod/schemas/account-schema'

export const makeRecoverPasswordController = (): RecoverPasswordController => {
  const accountRepository = new SequelizeAccountRepositoryAdapter(AccountModel)
  const token = new JwtTokenAdapter()
  const emailProvider = new NodeMailerEmailAdapter()
  const sendRecoverEmail = new SendRecoverEmail(accountRepository, token, emailProvider)
  //
  const recoverPasswordSchema = accountSchema.pick({ email: true })
  const validator = new ZodValidatorAdapter(recoverPasswordSchema)
  //
  return new RecoverPasswordController(sendRecoverEmail, validator)
}
