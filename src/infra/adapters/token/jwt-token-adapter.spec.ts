import { type SignOptions, type VerifyOptions } from 'jsonwebtoken'
import { type ParseTokenError, type TokenPayload } from '../../../domain/ports/token'
import { JwtTokenAdapter } from './jwt-token-adapter'
import { type Failure } from '../../../domain/protocols/either'

type FailureByParse = Failure<ParseTokenError, null>

interface SutTypes {
  sut: JwtTokenAdapter
  token: string
  parsedToken: TokenPayload
}

const makeSut = async (generateOptions?: SignOptions, parseOptions?: VerifyOptions): Promise<SutTypes> => {
  const sut = new JwtTokenAdapter('secret_key', generateOptions, parseOptions)
  const token = await sut.generate({ id: 'id' })
  const parsedToken = (await sut.parse(token) as any).response

  return {
    sut,
    token,
    parsedToken
  }
}

describe('JwtTokenAdapter', () => {
  test('Parsed should returns an failure if invalid token', async () => {
    const { sut } = await makeSut()
    const parsedError = await sut.parse('invalid_token') as FailureByParse
    expect(parsedError.error).toEqual({ name: 'JsonWebTokenError', message: 'jwt malformed' })
  })

  test('Should returns an correct payload if parsed is success', async () => {
    const { parsedToken } = await makeSut()

    expect(parsedToken).toHaveProperty('createdIn')
    expect(parsedToken).toHaveProperty('expiresIn')
  })

  test('Should return a valid token if everything is correct', async () => {
    const { token } = await makeSut()
    expect(token.split('.').length - 1).toBe(2)
  })

  test('The payload returned from parse must be the same as the one passed to generate', async () => {
    const { parsedToken } = await makeSut()
    expect(parsedToken.payload).toEqual({ id: 'id' })
  })

  test('Expiration time must be greater than the creation time', async () => {
    const { parsedToken: { createdIn, expiresIn } } = await makeSut({ expiresIn: '1d' })
    expect(expiresIn > createdIn).toBe(true)
  })
})
