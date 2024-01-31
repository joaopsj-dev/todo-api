/* eslint-disable @typescript-eslint/no-floating-promises */
const dotenv = require('dotenv')
dotenv.config()
import { type SendEmailData, type EmailProvider } from '../../../domain/ports/email'
import { transporter } from '../../email/config'

export class NodeMailerEmailAdapter implements EmailProvider {
  send ({ to, subject, html }: SendEmailData): void {
    transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html
    })
  }
}
