import { type GenerateOptions, type ParseTokenError, type Token, type TokenPayload } from '../../../domain/ports/token'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { success, type Either, failure } from '../../../domain/protocols/either'

export class JwtTokenAdapter implements Token {
  async generate (payload: any, { secretKey, expiresIn }: GenerateOptions): Promise<string> {
    return jwt.sign(payload, secretKey, { expiresIn })
  }

  async parse (token: string, secretKey: string): Promise<Either<ParseTokenError, TokenPayload>> {
    try {
      const { exp, iat, ...payload } = jwt.verify(token, secretKey) as JwtPayload
      return success({ payload, createdIn: iat, expiresIn: exp })
    } catch ({ name, message }: any) {
      return failure({ name, message })
    }
  }
}
