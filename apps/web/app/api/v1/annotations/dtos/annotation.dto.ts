import { z } from 'zod';

import { Annotations } from '~/lib/annotations.types';

export const CreateAnnotationSchema = z
  .object({
    file_id: z.string().uuid({ message: 'File ID must be a valid UUID' }),
    user_id: z.string().uuid({ message: 'User ID must be a valid UUID' }),
    content: z.string().min(1, { message: 'Content is required' }),
    position_x: z.number().positive('Position X must be positive'),
    position_y: z.number().positive('Position Y must be positive'),
    page_number: z.number().int().positive().optional(),
    number: z.number().optional(),
    status: z
      .enum([
        Annotations.AnnotationStatusKeys.ACTIVE,
        Annotations.AnnotationStatusKeys.COMPLETED,
        Annotations.AnnotationStatusKeys.DRAFT,
      ])
      .default('active'),
  })
  .strict();

export const UpdateAnnotationSchema = z
  .object({
    status: z.enum(
      [
        Annotations.AnnotationStatusKeys.ACTIVE,
        Annotations.AnnotationStatusKeys.COMPLETED,
        Annotations.AnnotationStatusKeys.DRAFT,
      ],
      { message: 'Invalid status value' },
    ),
  })
  .strict();

  export const CreateMessageSchema = z
  .object({
    content: z.string().min(1, { message: 'Message content is required' }),
    user_id: z.string().uuid({ message: 'User ID must be a valid UUID' }),
  })
  .strict();

export type CreateMessageDTO = z.infer<typeof CreateMessageSchema>;
export type UpdateAnnotationDTO = z.infer<typeof UpdateAnnotationSchema>;
export type CreateAnnotationDTO = z.infer<typeof CreateAnnotationSchema>;
