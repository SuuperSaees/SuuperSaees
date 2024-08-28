"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
// import convertToSubcurrency from "./convertToSubcurrency";
import RegisterStripePage from "./register-stripe-page";
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useEffect, useState } from "react";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function RegisterAccountContainer() {
    const supabase = useSupabase();
    const [email, setEmail] = useState('');
    // const amount = 49.99;
    useEffect(() => {
        const fetchUserEmail = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error);
            } else {
                setEmail(user?.email ?? '');
            }
        };

        fetchUserEmail();
    }, [supabase]);
    
    return (
        <div>
            <Elements 
                stripe={stripePromise}
                // options={
                //     {
                //         mode: 'payment',
                //         amount: convertToSubcurrency(amount),
                //         currency: 'usd',
                //     }
                // }
            >
                <RegisterStripePage  email={email}/>
            </Elements>

        </div>
        
    );
}