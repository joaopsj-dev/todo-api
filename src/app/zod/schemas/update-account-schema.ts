import { z } from 'zod';
import { accountIdSchema } from './accountId-schema';

export const updateAccountSchema = z.object({
  name: z.string({ required_error: 'name is required' }).min(2).optional(),
  email: z.string({ required_error: 'email is required' }).email().optional(),
  password: z.string({ required_error: 'password is required' }).min(6).optional()
}).merge(accountIdSchema)
  .strict()
  .refine(obj => !(!obj.email && !obj.name && !obj.password), { message: 'It is necessary to pass at least one field to be updated' })
