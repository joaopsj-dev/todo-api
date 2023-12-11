/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { type ValidateError, type Validator } from '../../../domain/ports/validate'
import { type ZodError, type ZodSchema } from 'zod'
import { failure, type Either, success } from '../../../domain/protocols/either';

export class ZodValidatorAdapter implements Validator {
  constructor (private readonly schema: ZodSchema) {}

  async validate (data: any): Promise<Either<ValidateError, void>> {
    try {
      this.schema.parse(data)
      return success(undefined)
    } catch (error) {
      const mapedError = (error as ZodError).issues.map(error => ({
        paramName: error.path[0] as string,
        message: error.message
      }))
      return failure(mapedError)
    }
  }
}
