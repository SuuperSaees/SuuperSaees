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

interface accountSchema {
    email: string;
    slug: string;
    stripeId: string;
}

export default function RegisterAccountContainer() {
    const supabase = useSupabase();
    const [account, setAccount] = useState<accountSchema>({
        email: "",
        slug: "",
        stripeId: ""
    })
    // const amount = 49.99;
    useEffect(() => {
        const fetchUserEmail = async () => {
            
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            const email = user?.email as string;
            const responseDataAccount = await supabase
            .from("accounts")
            .select("*")
            .eq("email", email);

            if (error) {
                console.error("Error fetching user:", error);
            } else {
                if (responseDataAccount.data && responseDataAccount.data.length > 0){
                    const accountData = responseDataAccount.data[0]
                    const email= accountData?.email as string;
                    const slug= accountData?.slug as string;
                    const stripeId= accountData?.email as string;
                    setAccount({
                        email,
                        slug,
                        stripeId
                    })
                }
            }
        };

        void fetchUserEmail();
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
                <RegisterStripePage  email={account?.email} stripeId={account?.stripeId} slug={account?.slug}/>
            </Elements>

        </div>
        
    );
}