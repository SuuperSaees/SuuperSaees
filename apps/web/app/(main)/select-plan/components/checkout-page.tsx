"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@kit/ui/button";
import { useRouter } from 'next/navigation';

const CheckoutPage = ({ amount, priceId, billingCustomerId, seats }: { amount: number, priceId: string, billingCustomerId: string, seats: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch("/api/stripe/suuper-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId, customer: billingCustomerId, seats }),
    })
      .then((res) => res.clone().json())
      .then((data) => {
        setClientSecret(data.sessionUrl);
      });
  }, [priceId]);

  useEffect(() => {
    if (clientSecret.startsWith("http")) {
      router.push(clientSecret);
    }
  }, [clientSecret]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) { 
    return (
      <div className="flex items-center justify-center">
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

  return (
    <form onSubmit={handleSubmit}>
      {!clientSecret.startsWith("http") ? (
        <>
          <PaymentElement />
          {errorMessage && <div>{errorMessage}</div>}
          <Button
            disabled={!stripe || loading || !clientSecret}
            className="w-full p-5 mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
          >
            {!loading ? `Pay $${amount} USD` : "Processing..."}
          </Button>
        </>
      ) : <div className="flex items-center justify-center">
      <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>}
    </form>
  );
};

export default CheckoutPage;
