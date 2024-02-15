import { z } from 'zod'

export const taskIdSchema = z.object({
  taskId: z.string({ required_error: 'taskId is required' })
})
