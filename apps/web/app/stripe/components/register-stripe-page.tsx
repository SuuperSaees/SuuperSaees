"use client";

import React, {useEffect, useState} from "react";
import {
    useStripe,
    useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@kit/ui/button";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import { updateTeamAccountStripeId } from '../../../../../packages/features/team-accounts/src/server/actions/team-details-server-actions';

type AccountSchema = {
  email: string | null | undefined;
  id: string | null | undefined;
  stripeId: string | null | undefined;
}

const RegisterStripePage = ({ email, stripeId, id}: AccountSchema) => {
  const { t } = useTranslation('stripe');
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string>();
    const [accountId, setAccountId] = useState(stripeId);
    const [linkData, setLinkData] = useState("");
    
    useEffect(() => {
      if (!stripeId) {
        fetch("/api/stripe/create-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email }),
        })
        .then((res) => res.json())
        .then(async (data) => {
          // SAVE OR UPDATE ACCOUNT ID
          setAccountId(data.accountId);
          await updateTeamAccountStripeId({
            stripe_id: data.accountId as string,
            id: id as string
          });
          // toast.promise(promise, {
          //   loading: t('updateTeamLoadingMessage'),
          //   success: t('updateTeamSuccessMessage'),
          //   error: t('updateTeamErrorMessage'),
          // });

          fetch("/api/stripe/account-onboarding", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ accountId: data.accountId }),
          })
            .then((res) => res.json())
            .then((linkData) => {
                setLinkData(linkData.url);
            })
            .catch((error) => {
              setErrorMessage(error.message);
            });


            }).catch((error) => {
                setErrorMessage(error.message);
            });
      } else {
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
      }
    }, [stripe, elements, t]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setErrorMessage("Stripe or elements not loaded");
            return;
        }

        const { error: submitError } = await elements.submit();

        if (submitError) {
            setErrorMessage(submitError.message);
        }
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