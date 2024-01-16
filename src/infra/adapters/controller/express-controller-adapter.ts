import { type Request, type Response } from 'express'
import { type HttpRequest, type Controller } from '../../../presentation/protocols'

export const expressControllerAdapter = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      headers: req.headers
    }
    const httpResponse = await controller.handle(httpRequest)
    res.status(httpResponse.statusCode).json(httpResponse.body)
  }
}
