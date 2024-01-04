import { type TokenPayload, type GenerateOptions, type ParseTokenError } from '../../../domain/ports/token'
import { type Success, type Failure } from '../../../domain/protocols/either'
import { JwtTokenAdapter } from './jwt-token-adapter'
import jwt from 'jsonwebtoken'

const makeFakeGenerateOptions = (): GenerateOptions => ({
  secretKey: 'any_secretKey',
  expiresIn: '10s'
})

const makeFakePayload = (): any => ({
  id: 'any_id'
})

const makeSut = (): JwtTokenAdapter => {
  const sut = new JwtTokenAdapter()

  return sut
}

type SuccessByParse = Success<null, TokenPayload>
type FailureByParse = Failure<ParseTokenError, null>

describe('JwtTokenAdapter', () => {
  test('Should call sign method with correct values', async () => {
    const sut = makeSut()

    const jwtSpy = jest.spyOn(jwt, 'sign')
    await sut.generate(makeFakePayload(), makeFakeGenerateOptions())

    expect(jwtSpy).toHaveBeenCalledWith(
      { id: 'any_id' },
      'any_secretKey',
      { expiresIn: '10s' }
    )
  })

  test('Should return a valid token on generate success', async () => {
    const sut = makeSut()

    const token = await sut.generate(makeFakePayload(), makeFakeGenerateOptions())

    expect(token.split('.').length - 1).toBe(2)
  })

  test('Parsed should returns an failure if invalid token', async () => {
    const sut = makeSut()
    const accessTokenError = await sut.parse('invalid_token', 'any_secret_key') as FailureByParse

    expect(accessTokenError.error).toEqual(expect.objectContaining({
      name: expect.any(String),
      message: expect.any(String)
    }))
  })

  test('Should returns an correct payload on parsed success', async () => {
    const sut = makeSut()

    const token = await sut.generate(makeFakePayload(), makeFakeGenerateOptions())
    const parsedToken = await sut.parse(token, 'any_secretKey') as SuccessByParse

    expect(parsedToken.response).toEqual(expect.objectContaining({
      payload: { id: 'any_id' },
      expiresIn: expect.any(Number),
      createdIn: expect.any(Number)
    }))
  })
})
