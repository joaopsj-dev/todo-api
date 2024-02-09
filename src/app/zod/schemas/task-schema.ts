import { z } from 'zod';

export const objectDate = z.object({
  year: z.number({ required_error: 'year is required' }).gte(1000).lte(9999),
  month: z.number({ required_error: 'month is required' }).gte(1).lte(12),
  day: z.number({ required_error: 'day is required' }).gte(1).lte(31),
  hour: z.number({ required_error: 'hour is required' }).gte(0).lte(60),
  minute: z.number({ required_error: 'minute is required' }).gte(0).lte(60)
}).strict()

export const taskSchema = z.object({
  name: z.string({ required_error: 'name is required' }).min(1),
  accountId: z.string({ required_error: 'accountId is required' }),
  isNotify: z.boolean({ required_error: 'isNotify is required' }),
  description: z.string({ required_error: 'description is required' }).min(1).optional(),
  notifyDate: objectDate.optional(),
  endDate: objectDate.optional()
}).strict()
