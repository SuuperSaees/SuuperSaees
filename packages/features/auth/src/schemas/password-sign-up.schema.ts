import { z } from 'zod';

import { RefinedPasswordSchema, refineRepeatPassword } from './password.schema';

export const PasswordSignUpSchema = z
  .object({
    email: z.string().email(),
    password: RefinedPasswordSchema,
    repeatPassword: RefinedPasswordSchema,
    invite_token: z.string().optional(),
    organizationName: z.string(),
  })
  .superRefine(refineRepeatPassword)
  .superRefine((data, ctx) => {
    if (data.invite_token && !data.organizationName) {
      return true;
    }
    if (!data.invite_token && !data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "organizationName is required when there is no invite_token",
        path: ["organizationName"],
      });
    }
  });
