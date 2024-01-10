/* eslint-disable import/first */
const dotenv = require('dotenv')
dotenv.config()
import { type EmailProvider, type AccountRepository, type Token } from './send-recover-email-protocols'
import token_protocols from '../../protocols/token'
import recoverPasswordHtml from '../../html/recover-password/recover-password'

export class SendRecoverEmail {
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly token: Token,
    private readonly emailProvider: EmailProvider
  ) {}

  async send (email: string): Promise<boolean> {
    const accountByEmail = await this.accountRepository.findByEmail(email)
    if (!accountByEmail) return false

    const recoverToken = await this.token.generate({ email }, {
      expiresIn: token_protocols.recover_token_expires_in,
      secretKey: token_protocols.recoverToken_secret_key
    })

    await this.emailProvider.send({
      to: email,
      subject: 'Token de Recuperação de Senha',
      html: recoverPasswordHtml.replace('{TOKEN}', recoverToken)
    })
  }
}
