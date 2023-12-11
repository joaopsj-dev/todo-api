import { type ValidateError } from '../../../domain/ports/validate'
import { type Success, type Failure } from '../../../domain/protocols/either'
import { type ZodSchema, z } from 'zod'
import { ZodValidatorAdapter } from './zod-validator-adapter'

type SuccessByValidate = Success<null, void>
type FailureByValidate = Failure<ValidateError, null>

const fakeSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
})

const makeValidData = (): z.infer<typeof fakeSchema> => ({
  name: 'valid_name',
  email: 'valid_email@email.com',
  password: 'valid_password'
})

interface SutTypes {
  sut: ZodValidatorAdapter
  schemaStub: ZodSchema
}

const makeSut = (): SutTypes => {
  const schemaStub = fakeSchema
  const sut = new ZodValidatorAdapter(schemaStub)

  return {
    sut,
    schemaStub
  }
}

describe('ZodValidatorAdapter', () => {
  test('Should returns an correct error if failure', async () => {
    const { sut } = makeSut()
    const validatedError = await sut.validate({}) as FailureByValidate

    validatedError.error.forEach(err => {
      expect(err).toHaveProperty('paramName')
      expect(err.message).toBe('Required')
    })
  })

  test('Should returns an void if success', async () => {
    const { sut } = makeSut()
    const validatedResponse = await sut.validate(makeValidData()) as SuccessByValidate
    expect(validatedResponse.response).toBeUndefined()
  })

  test('Should call parse with correct values', async () => {
    const { sut, schemaStub } = makeSut()
    const schemaSpy = jest.spyOn(schemaStub, 'parse')
    await sut.validate(makeValidData())
    expect(schemaSpy).toHaveBeenCalledWith(makeValidData())
  })
})
