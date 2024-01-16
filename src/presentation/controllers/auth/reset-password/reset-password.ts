import { type ResetPassword, type HttpRequest, type HttpResponse, type Controller, type Validator, type Token } from './reset-password-protocols'
import { badRequest, notFound, ok, serverError, unauthorized } from '../../../helpers/http-helper';
import token_protocols from '../../../../domain/protocols/token';

export class ResetPasswordController implements Controller {
  constructor (
    private readonly resetPassword: ResetPassword,
    private readonly validator: Validator,
    private readonly token: Token
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate(httpRequest.body)
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const [, recoverPasswordToken] = httpRequest?.headers?.authorization.split('Bearer ')
      const parseResponse = await this.token.parse(recoverPasswordToken, token_protocols.recoverToken_secret_key)
      if (parseResponse.isFailure()) return unauthorized({ message: 'Invalid or expired token' })

      const resetPasswordResponse = await this.resetPassword.reset({
        password: httpRequest.body.password,
        accountId: parseResponse.response.payload.id
      })
      if (!resetPasswordResponse) return notFound({ message: 'Account not found' })

      return ok({ message: 'Successful updated password' })
    } catch (error) {
      return serverError(error as any)
    }
  }
}
