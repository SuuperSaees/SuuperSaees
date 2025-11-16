"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
// import convertToSubcurrency from "./convertToSubcurrency";
// import RegisterStripePage from "./register-stripe-page";
// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
// import { useEffect, useState } from "react";
// import CheckoutPage from "./checkout-page";
// import convertToSubcurrency from "./convertToSubcurrency";
import PlansPage from "./plans-page";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);


export default function PlansContainer({seats}: {seats: number}) {
    
    return (
        <div className="w-full h-full">
            <Elements 
                stripe={stripePromise}
            >
                <PlansPage seats={seats} />
            </Elements>

        </div>
        
    );
}