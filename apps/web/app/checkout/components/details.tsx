'use client';

import React from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { Service } from '~/lib/services.types';
import convertToSubcurrency from '~/select-plan/components/convertToSubcurrency';

import BillingForm from './billing_form';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe public key is not defined in environment variables');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY, {
  stripeAccount: 'acct_1Pt8YsQLXPK9AJfG',
});

type ServiceType = Service.Type;

type DetailsSideProps = {
  service: ServiceType;
  stripeId: string;
  organizationId: string;
  tokenId: string;
};

const DetailsSide: React.FC<DetailsSideProps> = ({
  service,
  stripeId,
  organizationId,
  tokenId,
}) => {
  return (
    <div>
      <Elements
        stripe={stripePromise}
        options={{
          mode: service.recurrence ? 'subscription' : 'payment',
          amount: convertToSubcurrency(service.price ?? 0),
          currency: 'usd',
        }}
      >
        <BillingForm
          service={service}
          stripeId={stripeId}
          organizationId={organizationId}
          tokenId={tokenId}
        />
      </Elements>
    </div>
  );
};

export default DetailsSide;
