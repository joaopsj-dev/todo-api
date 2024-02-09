import { z } from 'zod';
import { accountSchema } from './account-schema';

export const resetPasswordSchema = accountSchema.pick({ password: true }).merge(z.object({
  'x-recover-password-token': z.string({ required_error: 'x-recover-password-token is required' })
})).strict()
