import { z } from 'zod';

export const TeamNameFormSchema = z.object({
  name: z.string().min(1).max(255),
});

export const TeamStripeIdFormSchema = z.object({
  stripe_id: z.string()
})

export const UpdateTeamNameSchema = TeamNameFormSchema.merge(
  z.object({
    slug: z.string().min(1).max(255),
    path: z.string().min(1).max(255),
  }),
);

export const UpdateTeamStripeIdSchema = TeamStripeIdFormSchema.merge(
  z.object({
    id: z.string(),
  })
)