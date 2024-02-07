import { type HttpResponse, type HttpRequest, type Middleware, type ValidateAccess } from './auth-middleware-protocols'
import { forbidden, ok, serverError } from '../../helpers/http-helper';

export class AuthMiddleware implements Middleware {
  constructor (
    private readonly validateAccess: ValidateAccess
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const accessToken = httpRequest.headers?.['x-access-token']

      const isAccessValidated = await this.validateAccess.validate(accessToken)

      return isAccessValidated ? ok({}) : forbidden({ message: 'Access denied' })
    } catch (error) {
      return serverError()
    }
  }
}
