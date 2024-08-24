"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "./convertToSubcurrency";
import CheckoutPage from "./CheckoutPage";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function PayContainer() {
    const amount = 49.99;
    
    return (
        <div>
            <h1>Sonny</h1>
            <h2>has requested
                <span>${amount}</span>
            </h2>

            <Elements 
                stripe={stripePromise}
                options={
                    {
                        mode: 'payment',
                        amount: convertToSubcurrency(amount),
                        currency: 'usd',
                    }
                }
            >
                <CheckoutPage amount={amount}/>
            </Elements>

        </div>
        
    );
}