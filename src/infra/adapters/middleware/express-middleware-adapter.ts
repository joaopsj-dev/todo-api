import { type NextFunction, type Request, type Response } from 'express'
import { type HttpRequest, type Middleware } from '../../../presentation/protocols'

export const expressMiddlewareAdapter = (middleware: Middleware) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const httpRequest: HttpRequest = {
      headers: req.headers
    }
    const httpResponse = await middleware.handle(httpRequest)
    if (httpResponse.statusCode !== 200) {
      return res.status(httpResponse.statusCode).json({ error: httpResponse.body.message })
    }
    next()
  }
}
