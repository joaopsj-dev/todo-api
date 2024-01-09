const dotenv = require('dotenv')
dotenv.config()
import { type SendEmailData, type EmailProvider } from '../../../domain/ports/email'
import { transporter } from '../../email/config'

export class NodeMailerEmailAdapter implements EmailProvider {
  async send ({ to, subject, html }: SendEmailData): Promise<void> {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html
    })
  }
}
