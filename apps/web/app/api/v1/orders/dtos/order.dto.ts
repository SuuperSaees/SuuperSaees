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
          form_fields: z.array(z.object({
            form_field_id: z.string().uuid(),
            type: z.string(),
            response: z.string()
          })),
        })
      )
      .optional(),
  })
  .strict();

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>; 