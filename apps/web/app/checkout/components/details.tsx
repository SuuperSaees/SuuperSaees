'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { Service } from '~/lib/services.types';
import convertToSubcurrency from '~/(main)/select-plan/components/convertToSubcurrency';
import { BillingAccounts } from '~/lib/billing-accounts.types';
import BillingForm from './billing-form';
import { Invoice } from '~/lib/invoice.types';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe public key is not defined in environment variables');
}

type DetailsSideProps = {
  service?: Service.Relationships.Billing.BillingService;
  invoice?: Invoice.Response;
  stripeId: string;
  logoUrl: string;
  sidebarBackgroundColor: string;
  paymentMethods?: BillingAccounts.PaymentMethod[];
  manualPayment?: BillingAccounts.PaymentMethod
};

const DetailsSide: React.FC<DetailsSideProps> = ({
  service,
  stripeId,
  logoUrl,
  sidebarBackgroundColor,
  paymentMethods,
  invoice,
  manualPayment
}) => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '', {
    stripeAccount: stripeId,
  });

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: service?.recurrence ? 'subscription' : 'payment',
        amount: convertToSubcurrency(service ? service.price ?? 0 : invoice?.total_amount ?? 0),
        currency: (service?.currency ?? invoice?.currency ?? 'usd').toLowerCase(),
      }}
    >
      <BillingForm
        service={service}
        invoice={invoice}
        stripeId={stripeId}
        logoUrl={logoUrl}
        sidebarBackgroundColor={sidebarBackgroundColor}
        paymentMethods={paymentMethods ?? []}
        manualPayment={manualPayment}
      />
    </Elements>
  );
};

export default DetailsSide;
