import { type Either } from '../protocols/either'

// eslint-disable-next-line @typescript-eslint/array-type
export type ValidateError = {
  paramName: string
  message: string
}[]

export interface Validator {
  validate: (data: any) => Promise<Either<ValidateError, any>>
}
