import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string({ required_error: 'name is required' }).min(2),
  email: z.string({ required_error: 'email is required' }).email(),
  password: z.string({ required_error: 'password is required' }).min(6)
})
