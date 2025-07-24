import { z } from 'zod';

export const WhiteLabelAgencyMemberSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type WhiteLabelAgencyMemberSignUpData = z.infer<typeof WhiteLabelAgencyMemberSignUpSchema>;
