import { type Either } from '../protocols/either'

export interface ParseTokenError {
  name: string
  message: string
}

export interface TokenPayload {
  payload: any
  expiresIn: number
  createdIn: number
}

export interface Token {
  generateAccessToken: (payload: any) => Promise<string>
  parseAccessToken: (token: string) => Promise<Either<ParseTokenError, TokenPayload>>

  generateRefreshToken: (payload: any) => Promise<string>
  parseRefreshToken: (token: string) => Promise<Either<ParseTokenError, TokenPayload>>
}
