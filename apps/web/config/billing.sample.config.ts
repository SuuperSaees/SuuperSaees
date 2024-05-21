/**
 * This is a sample billing configuration file. You should copy this file to `billing.config.ts` and then replace
 * the configuration with your own billing provider and products.
 */
import { BillingProviderSchema, createBillingSchema } from '@kit/billing';

// The billing provider to use. This should be set in the environment variables
// and should match the provider in the database. We also add it here so we can validate
// your configuration against the selected provider at build time.
const provider = BillingProviderSchema.parse(
  process.env.NEXT_PUBLIC_BILLING_PROVIDER,
);

export default createBillingSchema({
  // also update config.billing_provider in the DB to match the selected
  provider,
  // products configuration
  products: [
    {
      id: 'starter',
      name: 'billing:plans.starter.name',
      description: 'billing:plans.starter.description',
      currency: 'USD',
      badge: `billing:plans.starter.badge`,
      plans: [
        {
          name: 'Starter Monthly',
          id: 'starter-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_1PBZTjKgHmU99VeOMbvSb4pO',
              name: 'billing:plans.starter.base',
              cost: 9.99,
              type: 'flat' as const,
            },
          ],
        },
        {
          name: 'Starter Yearly',
          id: 'starter-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'price_1PBZTjKgHmU99VeOjAIBIT6r',
              name: 'billing:plans.starter.base',
              cost: 99.99,
              type: 'flat' as const,
            },
          ],
        },
      ],
      features: [
        'billing:plans.starter.features.maxTokens',
        'billing:plans.features.chatSupport',
      ],
    },
    {
      id: 'pro',
      name: 'billing:plans.pro.name',
      badge: 'billing:plans.pro.badge',
      highlighted: true,
      description: 'billing:plans.pro.description',
      currency: 'USD',
      plans: [
        {
          name: 'Pro Monthly',
          id: 'pro-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_1PBZWOKgHmU99VeOYvZAKi20',
              name: 'Base',
              cost: 19.99,
              type: 'flat',
            },
          ],
        },
        {
          name: 'Pro Yearly',
          id: 'pro-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'price_1PBZWyKgHmU99VeOgHd1RdNG',
              name: 'Base',
              cost: 199.99,
              type: 'flat',
            },
          ],
        },
      ],
      features: [
        'billing:plans.pro.features.maxTokens',
        'billing:plans.features.chatSupport',
      ],
    },
    {
      id: 'enterprise',
      name: 'billing:plans.enterprise.name',
      description: 'billing:plans.enterprise.description',
      currency: 'USD',
      plans: [
        {
          name: 'Enterprise Monthly',
          id: 'enterprise-monthly',
          paymentType: 'recurring',
          label: 'common:contactUs',
          href: '/contact',
          custom: true,
          interval: 'month',
          lineItems: [],
        },
        {
          name: 'Enterprise Yearly',
          id: 'enterprise-yearly',
          paymentType: 'recurring',
          label: 'common:contactUs',
          href: '/contact',
          custom: true,
          interval: 'year',
          lineItems: [],
        },
      ],
      features: [
        'billing:plans.enterprise.features.maxTokens',
        'billing:plans.enterprise.features.chatSupport',
      ],
    },
  ],
});
