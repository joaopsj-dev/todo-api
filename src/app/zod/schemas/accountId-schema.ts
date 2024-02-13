import { z } from 'zod'

export const accountIdSchema = z.object({
  accountId: z.string({ required_error: 'accountId is required' })
})
