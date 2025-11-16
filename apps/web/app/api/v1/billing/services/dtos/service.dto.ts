import { z } from 'zod';

import { BillingAccounts as BillingAccountsTypes } from '~/lib/billing-accounts.types';

// import { BillingAccountBuilder } from '../../accounts/builders/account.builder';

export const CreateServiceSchema = z
  .object({
    id: z.number().nullable().optional(),
    provider_id: z.string().nullable().optional(),
    name: z.string().min(1, 'Name is required'),
    provider: z.enum([
      BillingAccountsTypes.BillingProviderKeys.TRELI,
      BillingAccountsTypes.BillingProviderKeys.STRIPE,
      BillingAccountsTypes.BillingProviderKeys.SUUPER,
      BillingAccountsTypes.BillingProviderKeys.LEMON_SQUEEZY,
      BillingAccountsTypes.BillingProviderKeys.PADDLE,
    ]),
    organizationId: z.string().min(1, 'Organization ID is required'),
    service_description: z.string().nullable().optional(),
    service_image: z.string().nullable().optional(),
    price: z.number().nullable().optional(),
    recurring_subscription: z.boolean().nullable().optional(),
    credit_based: z.boolean().nullable().optional(),
    credits: z.number().nullable().optional(),
    time_based: z.boolean().nullable().optional(),
    hours: z.number().nullable().optional(),
    test_period: z.boolean().nullable().optional(),
    test_period_duration: z.number().nullable().optional(),
    test_period_duration_unit_of_measurement: z.string().nullable().optional(),
    test_period_price: z.number().nullable().optional(),
    allowed_orders: z.number().nullable().optional(),
    max_number_of_monthly_orders: z.number().nullable().optional(),
    max_number_of_simultaneous_orders: z.number().nullable().optional(),
    number_of_clients: z.number().nullable().optional(),
    purchase_limit: z.number().nullable().optional(),
    single_sale: z.boolean().nullable().optional(),
    standard: z.boolean().nullable().default(false),
    status: z
      .enum([
        'active',
        'inactive',
        'draft',
        'expired',
        'paused',
        'blocked',
        'scheduled',
        'pending',
        'deleted',
      ])
      .default('draft'),
    visibility: z.enum(['public', 'private']).default('private'),
    recurrence: z.string().nullable().optional(),
  })
  .strict();

export const UpdateServiceSchema = CreateServiceSchema.partial();

export type CreateServiceDTO = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceDTO = z.infer<typeof UpdateServiceSchema>;
