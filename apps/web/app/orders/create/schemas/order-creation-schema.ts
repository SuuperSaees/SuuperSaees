import { z } from "zod";
type ValidationMessages = never
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';

export const generateOrderCreationSchema = (hasBriefs: boolean, t: TFunction<"orders", ValidationMessages>) => {
  return z.object({
    uuid: z.string(),
    title: 
      hasBriefs
        ? z.string().optional()
        : z
            .string()
            .min(2, { message: t('creation.validation.minTitleCharacters') }),
    description:
      hasBriefs
        ? z.string().optional()
        : z
            .string()
            .min(2, { message: t('creation.validation.minDescriptionCharacters') }),
    fileIds: z.array(z.string()),
    brief_responses: z
      .array(
        z.object({
          form_field_id: z.string(),
          brief_id: z.string(),
          order_id: z.string(),
          response: z
            .string()
            .min(2, {
              message: t('validation.minCharacters'),
            })
            .max(3000, {
              message: t('validation.maxCharacters'),
            }),
        }),
      )
      .optional(),
      order_followers: z.array(z.string()).optional(),
  });
}