import { z } from "zod";
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';

export const briefCreationFormSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(200, { message: 'Name must be at most 200 characters.' }),
    description: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
    default_question: z.object({
        id: z.string().optional(),
        label: z.string().min(1, { message: 'Question label cannot be empty.' }),
        description: z.string().optional().nullable(),
        placeholder: z.string().optional().nullable(),
        position: z.number(),
        required: z.boolean().optional().nullable(),
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
            })
          )
          .optional().nullable(),
    }),
    questions: z.array(
      z.object({
        id: z.string().optional(),
        position: z.number(),
        label: z.string().min(1, { message: 'Question label cannot be empty.' }),
        description: z.string().optional().nullable(),
        placeholder: z.string().optional().nullable(),
        required: z.boolean().optional().nullable(),
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

  export const generateBriefFormSchema = ( t: TFunction<'orders', never>) => {
    return z.object({
      name: z
        .string()
        .min(2, { message: t('validation.minCharacters') })
        .max(200, { message: t('validation.maxCharacters') }),
      description: z.string().optional().nullable(),
      image_url: z.string().optional().nullable(),
      default_question: z.object({
          id: z.string().optional(),
          label: z.string().min(1, { message: t('validation.labelRequired') }),
          description: z.string().optional().nullable(),
          placeholder: z.string().optional().nullable(),
          position: z.number(),
          required: z.boolean().optional().nullable(),
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
              })
            )
            .optional().nullable(),
      }),
      questions: z.array(
        z.object({
          id: z.string().optional(),
          position: z.number(),
          label: z.string().min(1, { message: t('validation.labelRequired') }),
          description: z.string().optional().nullable(),
          placeholder: z.string().optional().nullable(),
          required: z.boolean().optional().nullable(),
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
  }