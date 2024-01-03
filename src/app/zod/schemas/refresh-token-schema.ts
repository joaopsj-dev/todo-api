import { z } from 'zod';

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'refresh token is required' })
})
