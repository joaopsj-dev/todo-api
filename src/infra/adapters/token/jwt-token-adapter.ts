import { type ParseTokenError, type Token, type TokenPayload } from '../../../domain/ports/token'
import jwt, { type VerifyOptions, type JwtPayload, type SignOptions } from 'jsonwebtoken'
import { success, type Either, failure } from '../../../domain/protocols/either'

export class JwtTokenAdapter implements Token {
  constructor (
    private readonly secretKey: string,
    private readonly generateOptions?: SignOptions,
    private readonly parseOptions?: VerifyOptions
  ) {}

  async generate (payload: any): Promise<string> {
    return jwt.sign(payload, this.secretKey, this.generateOptions)
  }

  async parse (token: string): Promise<Either<ParseTokenError, TokenPayload>> {
    try {
      const { exp, iat, ...payload } = jwt.verify(token, this.secretKey, this.parseOptions) as JwtPayload
      return success({ payload, createdIn: iat, expiresIn: exp })
    } catch ({ name, message }: any) {
      return failure({ name, message })
    }
  }
}
