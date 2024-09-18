import React, { useEffect, useState } from "react";
import CheckoutPage from "./checkout-page"; 
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@kit/ui/button";
import { PricingTable } from '@kit/billing-gateway/marketing';
import billingConfig from '../../../../../apps/web/config/billing.config';
import pathsConfig from '../../../../../apps/web/config/paths.config';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const PlansPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null); 
  const [selectedPriceId, setSelectedPriceId] = useState(''); 

  useEffect(() => {
    setLoading(true);
    fetch("/api/stripe/suuper-products", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products: ", error);
        setErrorMessage("Error loading products");
        setLoading(false);
      });
  }, []);

  const handleCheckout = (amount: number | undefined, priceID: string) => {
    setSelectedAmount(amount ?? 0); 
    setSelectedPriceId(priceID);
  };

  if (loading) {
    return (
      <div className="items-center justify-center flex flex-col mt-10">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return <div className="text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="items-center justify-center flex flex-col mt-10 w-full">
      {selectedAmount ? (
        <div>
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: selectedAmount,
              currency: "usd",
            }}
          >
            <CheckoutPage amount={selectedAmount} priceId={selectedPriceId} />
          </Elements>
        </div>
      ) : <PricingTable
      config={billingConfig}
      paths={{
        signUp: pathsConfig.auth.signUp,
        return: pathsConfig.app.home,
      }}
      CheckoutButtonRenderer={handleCheckout}
    />}
    </div>
  );
};

export default PlansPage;