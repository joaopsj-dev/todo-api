import { type ParseTokenError, type TokenPayload } from '../../../domain/ports/token'
import { type Success, type Failure } from '../../../domain/protocols/either'
import { JwtTokenAdapter } from './jwt-token-adapter'

type SuccessByParse = Success<null, TokenPayload>
type FailureByParse = Failure<ParseTokenError, null>

interface SutTypes {
  sut: JwtTokenAdapter
  makeToken: string
  makeParsedToken: TokenPayload
}

const makeSut = async (): Promise<SutTypes> => {
  const sut = new JwtTokenAdapter()
  const makeToken = await sut.generate({ id: 'any_id' }, { expiresIn: '20m', secretKey: 'any_secret_key' })
  const { response: makeParsedToken } = await sut.parse(makeToken, 'any_secret_key') as SuccessByParse

  return {
    sut,
    makeToken,
    makeParsedToken
  }
}

describe('JwtTokenAdapter', () => {
  test('Parsed should returns an failure if invalid token', async () => {
    const { sut } = await makeSut()
    const accessTokenError = await sut.parse('invalid_token', 'any_secret_key') as FailureByParse

    expect(accessTokenError.error).toEqual({ name: 'JsonWebTokenError', message: 'jwt malformed' })
  })

  test('Should returns an correct payload if parsed is success', async () => {
    const { makeParsedToken } = await makeSut()

    expect(makeParsedToken).toEqual(expect.objectContaining({
      payload: { id: 'any_id' },
      expiresIn: expect.any(Number),
      createdIn: expect.any(Number)
    }))
  })

  test('Should return a valid token if everything is correct', async () => {
    const { makeToken } = await makeSut()

    expect(makeToken.split('.').length - 1).toBe(2)
  })

  test('The payload returned from parse must be the same as the one passed to generate', async () => {
    const { makeParsedToken } = await makeSut()

    expect(makeParsedToken.payload).toEqual({ id: 'any_id' })
  })
})
