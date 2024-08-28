// "use client";

// import React, {useEffect, useState} from "react";
// import {
//     useStripe,
//     useElements,
//     PaymentElement,
// } from "@stripe/react-stripe-js"
// import convertToSubcurrency from "./convertToSubcurrency";
// import { Button } from "@kit/ui/button";

// const CheckoutPage = ({ amount }: { amount: number }) => {
//     const stripe = useStripe();
//     const elements = useElements();

//     const [errorMessage, setErrorMessage] = useState<string>();
//     const [clientSecret, setClientSecret] = useState("");
//     const [loading, setLoading] = useState<boolean>(false);
    

//     useEffect(() => {
//         fetch("/api/stripe/create-payment-intent", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
//         })
//         .then((res) => res.json())
//             .then((data) => {
//                 console.log(data);
//                 setClientSecret(data.clientSecret);
//             })
//             .catch((error) => {
//                 setErrorMessage(error.message);
//             });
//     }, [amount, stripe, elements]);

//     const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         setLoading(true);

//         if (!stripe || !elements) {
//             setErrorMessage("Stripe or elements not loaded");
//             setLoading(false);
//             return;
//         }

//         const { error: submitError } = await elements.submit();

//         if (submitError) {
//             setErrorMessage(submitError.message);
//             setLoading(false);
//         }

//         const {error} = await stripe.confirmPayment({
//             elements,
//             clientSecret,
//             confirmParams: {
//                 return_url: `${window.location.origin}/payment-success?amount=${amount}`,
//             }
//         });

//         if (error){
//             setErrorMessage(error.message);
            
//         }

//         setLoading(false);
//     };

//     if (!clientSecret || !stripe || !elements) {
//         return (
//             <div className="flex items-center justify-center">
//               <div
//                 className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
//                 role="status"
//               >
//                 <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
//                   Loading...
//                 </span>
//               </div>
//             </div>
//           );
//     }

//     return(
//         <form onSubmit={handleSubmit}>
//             {clientSecret ? <PaymentElement/> : <div>Loading...</div>}
//             {errorMessage && <div>{errorMessage}</div>}
//             <Button
//                 disabled={!stripe || loading}
//                 className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
//             >
//                {!loading ? `Pay $${amount}` : "Processing..."}
//             </Button>
//         </form>
//     )

// }

// export default CheckoutPage;

"use client";

import React, {useEffect, useState} from "react";
import {
    useStripe,
    useElements,
    // PaymentElement,
} from "@stripe/react-stripe-js"
// import convertToSubcurrency from "./convertToSubcurrency";
import { Button } from "@kit/ui/button";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { updateTeamAccountStripeId } from '../../../../../packages/features/team-accounts/src/server/actions/team-details-server-actions';

const RegisterStripePage = ({  email, stripeId, slug}: { email: string, stripeId: string, slug: string }) => {
  const { t } = useTranslation('stripe');
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string>();
    const [accountId, setaccountId] = useState(stripeId);
    const [linkData, setLinkData] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
      if (!stripeId) {
        console.log("HOLAAA")
        fetch("/api/stripe/create-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email }),
        })
        .then((res) => res.json())
            .then((data) => {
              setaccountId(data.accountId);
            })
            .catch((error) => {
                setErrorMessage(error.message);
                // SAVE OR UPDATE ACCOUNT ID
              const promise = updateTeamAccountStripeId({
                stripe_id: stripeId,
                slug: slug
              });
              toast.promise(promise, {
                loading: t('updateTeamLoadingMessage'),
                success: t('updateTeamSuccessMessage'),
                error: t('updateTeamErrorMessage'),
              });
            });
      }
      fetch("/api/stripe/account-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ accountId }),
      })
        .then((res) => res.json())
        .then((linkData) => {
            setLinkData(linkData.url);
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    }, [email, stripe, elements, accountId, stripeId, slug, t]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setErrorMessage("Stripe or elements not loaded");
            setLoading(false);
            return;
        }

        const { error: submitError } = await elements.submit();

        if (submitError) {
            setErrorMessage(submitError.message);
            setLoading(false);
        }


        setLoading(false);
    };

    if (!accountId || !stripe || !elements) {
      return (
        <div className="flex items-center justify-center h-screen">
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
      <div className="flex items-center justify-center h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {email ? <div>{t('email')} {email}</div> : <div>Loading...</div>}
          {linkData ? (
            <Button>
              <Link href={linkData}>{t('completeRegister')}</Link>
            </Button>
          ) : (
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
          )}
          {errorMessage && <div>{errorMessage}</div>}
        </form>
      </div>
    );

}

export default RegisterStripePage;