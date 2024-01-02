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

export interface GenerateOptions {
  secretKey: string
  expiresIn: string
}

export interface Token {
  generate: (payload: any, generateOptions: GenerateOptions) => Promise<string>
  parse: (token: string, secretKey: string) => Promise<Either<ParseTokenError, TokenPayload>>
}
