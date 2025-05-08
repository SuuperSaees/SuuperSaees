import { z } from 'zod';

import { Annotation } from '~/lib/annotations.types';

export const CreateAnnotationSchema = z
  .object({
    file_id: z.string().uuid({ message: 'File ID must be a valid UUID' }),
    user_id: z.string().uuid({ message: 'User ID must be a valid UUID' }),
    content: z.string().min(1, { message: 'Content is required' }),
    position_x: z.number().positive({ message: 'Position X must be positive' }),
    position_y: z.number().positive({ message: 'Position Y must be positive' }),
    page_number: z.number().int().positive().optional(),
    number: z.number().optional(),
    status: z
      .enum([
        Annotation.AnnotationStatusKeys.ACTIVE,
        Annotation.AnnotationStatusKeys.COMPLETED,
        Annotation.AnnotationStatusKeys.DRAFT,
      ])
      .default('active'),
    parent_id: z
      .string()
      .uuid({ message: 'Parent ID must be a valid UUID' })
      .optional(),
  })
  .strict();

export const UpdateAnnotationSchema = z
  .object({
    status: z.enum(
      [
        Annotation.AnnotationStatusKeys.ACTIVE,
        Annotation.AnnotationStatusKeys.COMPLETED,
        Annotation.AnnotationStatusKeys.DRAFT,
      ],
      { message: 'Invalid status value' },
    ),
  })
  .strict();

export const CreateMessageSchema = z
  .object({
    content: z.string().min(1, { message: 'Message content is required' }),
    user_id: z.string().uuid({ message: 'User ID must be a valid UUID' }),
    parent_id: z.string().uuid({ message: 'Parent ID must be a valid UUID' }),
  })
  .strict();

export type CreateAnnotationDTO = z.infer<typeof CreateAnnotationSchema>;
export type UpdateAnnotationDTO = z.infer<typeof UpdateAnnotationSchema>;
export type CreateMessageDTO = z.infer<typeof CreateMessageSchema>;
