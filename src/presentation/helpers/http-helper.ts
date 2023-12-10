import { type HttpResponse } from '../protocols/http';

export const badRequest = (error: any): HttpResponse => ({
  statusCode: 400,
  body: error
})

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: {
    stack: error.stack
  }
})

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})
