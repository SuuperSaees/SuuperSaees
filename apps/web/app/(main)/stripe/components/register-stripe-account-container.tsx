'use client';

import { useEffect, useState } from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

// import convertToSubcurrency from "./convertToSubcurrency";
import RegisterStripePage from './register-stripe-page';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe public key is not defined in environment variables');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

type AccountSchema = {
  email: string | null | undefined;
  id: string | null | undefined;
  stripeId: string | null | undefined;
};

export default function RegisterAccountContainer() {
  const supabase = useSupabase();
  const [account, setAccount] = useState<AccountSchema>({
    email: '',
    id: '',
    stripeId: '',
  });
  // const amount = 49.99;
  useEffect(() => {
    const fetchUserEmail = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      const email = user?.email as string;
      const { data: responseDataAccount, error: errorResponseAccount } =
        await supabase.from('accounts').select('*').eq('email', email);

      if (errorResponseAccount) {
        console.error('Error fetching user:', error);
      } else {
        if (responseDataAccount && responseDataAccount.length > 0) {
          const accountData = responseDataAccount[0];
          setAccount({
            email: accountData?.email,
            id: accountData?.id,
            stripeId: accountData?.stripe_id,
          });
        }
      }
    };

    void fetchUserEmail();
  }, [supabase]);

  return (
    <Elements stripe={stripePromise}>
      {account?.email && account?.id && (
        <RegisterStripePage
          email={account?.email}
          stripeId={account?.stripeId}
          id={account?.id}
        />
      )}
    </Elements>
  );
}
