import { z } from 'zod';
import { taskIdSchema } from './taskId-schema';
import { objectDate } from './task-schema';

export const updateTaskSchema = z.object({
  name: z.string({ required_error: 'name is required' }).min(1).optional(),
  isNotify: z.boolean({ required_error: 'isNotify is required' }).optional(),
  description: z.string({ required_error: 'description is required' }).min(1).optional(),
  notifyDate: objectDate.optional(),
  endDate: objectDate.optional(),
  status: z.string({ required_error: 'status is required' }).min(1).refine(s => ['pending', 'in progress', 'concluded', 'delayed'].includes(s)).optional()
}).merge(taskIdSchema)
  .strict()
  .refine(obj => Object.keys(obj).length > 0, { message: 'It is necessary to pass at least one field to be updated' })
