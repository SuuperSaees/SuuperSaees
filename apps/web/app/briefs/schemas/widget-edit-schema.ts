import { z } from 'zod';

export const widgetEditSchema = z.object({
  id: z.string(),
  label: z.string().min(1, { message: 'Label cannot be empty.' }),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  position: z.number(),
  type: z
    .enum([
      'text',
      'text-short',
      'text-large',
      'select',
      'multiple_choice',
      'date',
      'number',
      'file',
      'dropdown',
      'h1',
      'h2',
      'h3',
      'h4',
      'rich-text',
      'image',
      'video',
    ])
    .optional(), // Allowing multiple types,
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        selected: z.boolean().optional(),
      }),
    )
    .optional().nullable(),
    required: z.boolean().optional().nullable(),
});
