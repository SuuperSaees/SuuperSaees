import { z } from 'zod';

import { FormField } from '~/lib/form-field.types';

// import type { TFunction } from '../../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';

// type ValidationMessages = never;

export const generateOrderCreationSchema = (
  hasBriefs: boolean,
  t: (key: string) => string,
  formFields: FormField.Type[] = [],
) => {
  
  const briefCompletionSchemaShape: Record<
    string,
    z.ZodString | z.ZodDate | z.ZodOptional<z.ZodString | z.ZodDate>
  > = {};

  formFields.forEach((field) => {
    let fieldSchema: z.ZodString | z.ZodOptional<z.ZodString> | z.ZodDate =
      z.string({ message: t('validation.required') });

    // Determine the type of schema based on the field type
    if (field.type === 'date') {
      // Use z.date() for date fields
      fieldSchema = z.date({
        required_error: t('validation.required'),
        invalid_type_error: t('validation.invalidDate'),
      });
    } else {
      // Default to string validation for other field types
      fieldSchema = z.string({ message: t('validation.required') });

      if (field.required) {
        fieldSchema = fieldSchema
          .min(2, { message: t('validation.minCharacters') })
          .max(3000, { message: t('validation.maxCharacters') });
      } else {
        fieldSchema = fieldSchema.optional();
      }
    }
    // Use the form field id as the key
    briefCompletionSchemaShape[field.id ?? ''] = fieldSchema;
  });

  return z.object({
    uuid: z.string(),
    title: hasBriefs
      ? z.string().optional()
      : z
          .string()
          .min(2, { message: t('creation.validation.minTitleCharacters') }),
    description: hasBriefs
      ? z.string().optional()
      : z.string().min(2, {
          message: t('creation.validation.minDescriptionCharacters'),
        }),
    files: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      size: z.number(),
      type: z.string(),
      url: z.string(),
      user_id: z.string(),
    })),
    brief_responses: z.object({
      ...briefCompletionSchemaShape,
    }),
    order_followers: z.array(z.string()).optional(),
  });
};
