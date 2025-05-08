import React, {useState } from "react";
import CheckoutPage from "./checkout-page"; 
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PricingTable } from '@kit/billing-gateway/marketing';
import pathsConfig from '../../../../../../apps/web/config/paths.config';
import useBilling from "../../../../../../apps/web/app/(main)/home/[account]/hooks/use-billing";
import { SkeletonCardPlans } from "../components/skeleton-card-plans";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const PlansPage = ({seats}: {seats: number}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { loading, errorMessage, productsDataConfig, subscription } = useBilling()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null); 
  const [selectedPriceId, setSelectedPriceId] = useState(''); 
  const [billingCustomerId, setBillingCustomerId] = useState<string | null>(null);
 
  const handleCheckout = (amount: number | undefined, priceID: string) => {
    setSelectedAmount(amount ?? 0); 
    setSelectedPriceId(priceID);
    setBillingCustomerId(subscription?.billing_customer_id ?? "")

  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full max-h-full min-h-[70vh] mt-4">
        <SkeletonCardPlans />
      </div>
    );
  }

  if (errorMessage) {
    return <div className="text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full max-h-full min-h-[70vh] mt-4">
      {selectedAmount ? (
        <div className="flex-1 w-full">
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: selectedAmount,
              currency: "usd",
            }}
          >
            <CheckoutPage amount={selectedAmount} priceId={selectedPriceId} billingCustomerId={billingCustomerId!} seats={seats}/>
          </Elements>
        </div>
      ) :
      <PricingTable
      paths={{
        signUp: pathsConfig.auth.signUp,
        return: pathsConfig.app.home,
      }}
      productsDataConfig={productsDataConfig}
      checkoutButtonRenderer={handleCheckout}
    />}
    </div>
  );
};

export default PlansPage;