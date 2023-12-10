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
  generate: (payload: any) => Promise<string>

  parse: (token: string) => Promise<Either<ParseTokenError, TokenPayload>>
}
