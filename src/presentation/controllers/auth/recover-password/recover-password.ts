import { type SendRecoverEmail, type Validator, type HttpRequest, type HttpResponse, type Controller } from './recover-password-protocols';
import { badRequest, notFound, ok, serverError } from '../../../helpers/http-helper';

export class RecoverPasswordController implements Controller {
  constructor (
    private readonly sendRecoverEmail: SendRecoverEmail,
    private readonly validator: Validator
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validateResponse = await this.validator.validate(httpRequest.body)
      if (validateResponse.isFailure()) {
        return badRequest(validateResponse.error)
      }

      const sendRecoverEmailResponse = await this.sendRecoverEmail.send(httpRequest.body.email)
      if (!sendRecoverEmailResponse) {
        return notFound({ message: 'E-mail not found' })
      }

      return ok({ message: 'Recovery e-mail sent successfully' })
    } catch (error) {
      return serverError(error as any)
    }
  }
}
