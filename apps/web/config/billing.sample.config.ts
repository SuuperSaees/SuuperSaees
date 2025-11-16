import { BillingProviderSchema, createBillingSchema, BillingConfig } from '@kit/billing';

// Obtener el proveedor de facturación desde las variables de sssss
const provider = BillingProviderSchema.parse(
  process.env.NEXT_PUBLIC_BILLING_PROVIDER,
);

const createBillingConfig = (): BillingConfig => {
  // Datos de productos estáticos
  const products = [
    {
      id: "prod_QqXPKWORe2Vq8C",
      name: "Starter",
      description: "Free. Up to 1 seat. Unlimited clients. Unlimited services. Unlimited orders. Brand assets.",
      plan: {
        id: "price_1PyqKoKTZtw7WxHovnSnApiM",
        currency: "USD",
        amount: 0, 
        interval: "month",
        trial_period_days: 0,
        billing_scheme: "per_seat",
      },
    },
    {
      id: "prod_QqXR8jY2WvtCEY",
      name: "Standard",
      description: "Up to 5 seats. Unlimited services. Unlimited clients. Unlimited orders. Brand assets. Powerful Reports.",
      plan: {
        id: "price_1PyqMDKTZtw7WxHoShIV9x7i",
        currency: "USD",
        amount: 2500,
        interval: "month",
        trial_period_days: 0,
        billing_scheme: "per_seat",
      },
    },
    {
      id: "prod_QqXS8aIy5zt7c0",
      name: "Premium",
      description: "Up to 10 seats. Unlimited services. Unlimited clients. Unlimited orders. Brand assets. Powerful Reports. Time Tracking. Task lists.",
      plan: {
        id: "price_1PyqN7KTZtw7WxHoeRJjdBGL",
        currency: "USD",
        amount: 4500,
        interval: "month",
        trial_period_days: 0,
        billing_scheme: "per_seat",
      },
    },
    {
      id: "prod_QqXTb5kIjd3g6z",
      name: "Enterprise",
      description: "More than 20 seats. Unlimited services. Unlimited clients. Unlimited orders. Brand assets. Powerful Reports. Time Tracking. Task lists. Advanced Security & SSO. API Integrations. Premium consulting and support services.",
      plan: {
        id: "price_1PyqORKTZtw7WxHo733q1DWn",
        currency: "USD",
        amount: 7500,
        interval: "month",
        trial_period_days: 0,
        billing_scheme: "per_seat",
      },
    },
  ];
  
  const result = createBillingSchema({
    provider,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      currency: product.plan.currency,
      badge: product.name,
      plans: [{
        name: product.name,
        id: product.plan.id,
        trialDays: product.plan.trial_period_days,
        paymentType: "recurring",
        interval: product.plan.interval,
        lineItems: [
          {
            id: product.plan.id,
            name: product.name,
            cost: product.plan.amount / 100, // Convertir de centavos a dólares
            type: product.plan.billing_scheme,
          }
        ]
      }],
      features: product.description.split('.'),
    })),
  });

  return result;
};

export default createBillingConfig();