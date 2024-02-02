import { type HttpResponse } from '../protocols/http';

export const forbidden = (error: any): HttpResponse => ({
  statusCode: 403,
  body: error
})

export const notFound = (error: any): HttpResponse => ({
  statusCode: 404,
  body: error
})

export const unauthorized = (error: any): HttpResponse => ({
  statusCode: 401,
  body: error
})

export const badRequest = (error: any): HttpResponse => ({
  statusCode: 400,
  body: error
})

export const conflict = (error: any): HttpResponse => ({
  statusCode: 409,
  body: error
})

export const serverError = (): HttpResponse => ({
  statusCode: 500,
  body: 'Internal server error'
})

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})
