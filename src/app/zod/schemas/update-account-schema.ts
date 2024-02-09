import { z } from 'zod';

export const updateAccountSchema = z.object({
  accountId: z.string({ required_error: 'accountId is required' }),
  name: z.string({ required_error: 'name is required' }).min(2).optional(),
  email: z.string({ required_error: 'email is required' }).email().optional(),
  password: z.string({ required_error: 'password is required' }).min(6).optional()
})
