'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { Service } from '~/lib/services.types';
import convertToSubcurrency from '~/(main)/select-plan/components/convertToSubcurrency';
import { BillingAccounts } from '~/lib/billing-accounts.types';
import BillingForm from './billing_form';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe public key is not defined in environment variables');
}

type ServiceType = Service.Type;

type DetailsSideProps = {
  service: ServiceType;
  stripeId: string;
  organizationId: string;
  logoUrl: string;
  sidebarBackgroundColor: string;
  paymentMethods?: BillingAccounts.PaymentMethod[];
};

const DetailsSide: React.FC<DetailsSideProps> = ({
  service,
  stripeId,
  organizationId,
  logoUrl,
  sidebarBackgroundColor,
  paymentMethods,
}) => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '', {
    stripeAccount: stripeId,
  });

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: service.recurrence ? 'subscription' : 'payment',
        amount: convertToSubcurrency(service.price ?? 0),
        currency: service.currency,
      }}
    >
      <BillingForm
        service={service}
        stripeId={stripeId}
        organizationId={organizationId}
        logoUrl={logoUrl}
        sidebarBackgroundColor={sidebarBackgroundColor}
        paymentMethods={paymentMethods ?? []}
      />
    </Elements>
  );
};

export default DetailsSide;
