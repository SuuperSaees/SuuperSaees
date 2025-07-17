import { z } from 'zod';

export const WhiteLabelClientSignUpSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100),
  email: z.string().email('emailInvalid').min(1, 'emailRequired'),
  organizationName: z.string().min(1, 'organizationRequired').max(100),
  password: z.string().min(6, 'passwordTooShort').max(99, 'passwordTooLong'),
  confirmPassword: z.string().min(1, 'confirmPasswordRequired'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordsDoNotMatch',
  path: ['confirmPassword'],
});

export type WhiteLabelClientSignUpData = z.infer<typeof WhiteLabelClientSignUpSchema>;
