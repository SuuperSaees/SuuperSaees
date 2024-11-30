import { z } from 'zod';

import { BillingAccounts as BillingAccountsTypes } from '~/lib/billing-accounts.types';

export const CreateAccountSchema = z
  .object({
    provider: z.enum([
      BillingAccountsTypes.BillingProviderKeys.TRELI,
      BillingAccountsTypes.BillingProviderKeys.STRIPE,
      BillingAccountsTypes.BillingProviderKeys.LEMON_SQUEEZY,
      BillingAccountsTypes.BillingProviderKeys.PADDLE,
      BillingAccountsTypes.BillingProviderKeys.SUUPER,
    ]),
    accountId: z.string().min(1, 'Account ID is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    namespace: z.string().default('production'),
  })
  .strict();

export const UpdateAccountSchema = z.object({
  provider: z.enum([
    BillingAccountsTypes.BillingProviderKeys.TRELI,
    BillingAccountsTypes.BillingProviderKeys.STRIPE,
    BillingAccountsTypes.BillingProviderKeys.LEMON_SQUEEZY,
    BillingAccountsTypes.BillingProviderKeys.PADDLE,
    BillingAccountsTypes.BillingProviderKeys.SUUPER,
  ]),
  username: z.string().min(1, 'Username is required'),
  accountId: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  namespace: z.string().default('production'),
});

export type CreateAccountDTO = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDTO = z.infer<typeof UpdateAccountSchema>;
