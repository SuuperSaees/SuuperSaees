import { z } from 'zod';

export const CreateOrderSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    due_date: z.string().optional(),
    brief_responses: z
      .array(
        z.object({
          brief_id: z.string().uuid(),
          response: z.union([z.string(), z.record(z.any())]),
        })
      )
      .optional(),
    order_followers: z.array(z.string().uuid()).optional(),
  })
  .strict();

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>; 