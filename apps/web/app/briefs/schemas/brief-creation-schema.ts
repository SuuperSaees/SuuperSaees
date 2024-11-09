import { z } from "zod";

export const briefCreationFormSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(200, { message: 'Name must be at most 200 characters.' }),
    description: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
    default_question: z.object({
        label: z.string().min(1, { message: 'Question label cannot be empty.' }),
        description: z.string().optional().nullable(),
        placeholder: z.string().optional().nullable(),
        position: z.number(),
        required: z.boolean().optional(),
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
          .optional(), // Allowing multiple types
        alert_message: z.string().optional().nullable(),
        options: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              selected: z.boolean().optional(),
            }),
          )
          .optional(),
    }),
    questions: z.array(
      z.object({
        id: z.union([z.string(), z.number()]).optional().nullable(),
        position: z.number(),
        label: z.string().min(1, { message: 'Question label cannot be empty.' }),
        description: z.string().optional().nullable(),
        placeholder: z.string().optional().nullable(),
        required: z.boolean().optional(),
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
          .optional(), // Allowing multiple types
        alert_message: z.string().optional().nullable(),
        options: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              selected: z.boolean().optional(),
            }),
          )
          .optional() 
          .nullable(),
      }),
    ),
    connected_services: z.array(z.number()),
  });