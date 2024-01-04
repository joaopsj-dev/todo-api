import { type ValidateError } from '../../../domain/ports/validate'
import { type Success, type Failure } from '../../../domain/protocols/either'
import { type ZodSchema, z } from 'zod'
import { ZodValidatorAdapter } from './zod-validator-adapter'

const makeFakeAccountSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
})

const makeFakeAccountData = (): z.infer<typeof makeFakeAccountSchema> => ({
  name: 'valid_name',
  email: 'valid_email@email.com',
  password: 'valid_password'
})

interface SutTypes {
  sut: ZodValidatorAdapter
  schemaStub: ZodSchema
}

const makeSut = (): SutTypes => {
  const schemaStub = makeFakeAccountSchema
  const sut = new ZodValidatorAdapter(schemaStub)

  return {
    sut,
    schemaStub
  }
}

type SuccessByValidate = Success<null, void>
type FailureByValidate = Failure<ValidateError, null>

describe('ZodValidatorAdapter', () => {
  test('Should return a correct error on failure', async () => {
    const { sut } = makeSut()

    const { error } = await sut.validate({}) as FailureByValidate

    error.forEach(err => {
      expect(err).toEqual(expect.objectContaining({
        paramName: expect.any(String),
        message: 'Required'
      }))
    })
  })

  test('Should return a void on success', async () => {
    const { sut } = makeSut()

    const validatedResponse = await sut.validate(makeFakeAccountData()) as SuccessByValidate

    expect(validatedResponse.response).toBeUndefined()
  })

  test('Should call parse with correct values', async () => {
    const { sut, schemaStub } = makeSut()

    const schemaSpy = jest.spyOn(schemaStub, 'parse')
    await sut.validate(makeFakeAccountData())

    expect(schemaSpy).toHaveBeenCalledWith(makeFakeAccountData())
  })
})
