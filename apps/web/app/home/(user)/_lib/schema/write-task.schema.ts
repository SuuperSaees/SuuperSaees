import { z } from 'zod';

export const WriteTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
});
