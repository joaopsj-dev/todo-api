import { transporter } from '../../email/config'
import { NodeMailerEmailAdapter } from './nodemailer-email-adapter'

const makeSut = (): NodeMailerEmailAdapter => {
  return new NodeMailerEmailAdapter()
}

describe('NodeMailer Adapter', () => {
  test('Should call sendmail with correct values', async () => {
    const sut = makeSut()

    const sendMailSpy = jest.spyOn(transporter, 'sendMail')
    await sut.send({ to: 'valid_email@mail.com', subject: 'any_subject' })

    expect(sendMailSpy).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.any(String),
      to: 'valid_email@mail.com',
      subject: 'any_subject',
      html: undefined
    }))
  })
})
