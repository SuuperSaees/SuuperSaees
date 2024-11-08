'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Separator } from '@kit/ui/separator';

import { ServiceType } from '../types/billing-form-types';
import { handleSubmitPayment } from '../utils/billing-handlers';
import { ServiceTypeSection } from './service-type-section';
import { SideInfo } from './side-information';
import { UserInfo } from './user-info';
import { toast } from 'sonner';

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state_province_region: z.string().min(1, 'State/Province/Region is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  buying_for_organization: z.boolean().default(false),
  enterprise_name: z.string(),
  tax_code: z.string(),
  discount_coupon: z.string(),
  card_name: z.string().min(1, 'Card name is required'),
});

const BillingForm: React.FC<{
  service: ServiceType;
  stripeId: string;
  organizationId: string;
  tokenId: string;
}> = ({ service, stripeId, organizationId, tokenId }) => {
  const { t } = useTranslation('services');
  const router = useRouter();

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [validSuccess, setValidSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      address: '',
      city: '',
      country: '',
      state_province_region: '',
      postal_code: '',
      buying_for_organization: false,
      enterprise_name: '',
      tax_code: '',
      discount_coupon: '',
      card_name: '',
    },
  });

  const handleCreateCard = async () => {
    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setErrorMessage('Card number element not found');
      return;
    }

    const { error: createError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: form.getValues('card_name'),
          address: {
            city: form.getValues('city'),
            line1: form.getValues('address'),
            postal_code: form.getValues('postal_code'),
          },
          email: form.getValues('email'),
        },
      });

    if (createError) {
      setErrorMessage(createError.message);
      return;
    }

    setErrorMessage('');

    return paymentMethod;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setValidSuccess(false);

    try {
      const paymentMethod = await handleCreateCard();

      if (!paymentMethod?.id) {
        throw new Error('Failed to create payment method');
      }

      const { success, error, accountAlreadyExists } = await handleSubmitPayment({
        service,
        values: values,
        stripeId,
        organizationId,
        paymentMethodId: paymentMethod.id,
        coupon: values.discount_coupon,
        tokenId: tokenId,
      });

      if (!success) {
        if(error === 'User already registered'){
          toast.error(`Payment processing failed: ${error} and is not a client account`);
          setErrorMessage(error ?? 'Payment processing failed');
        } else {
          toast.error(`Payment processing failed: ${error ?? 'Unknown error'}`);
          setErrorMessage(error ?? 'Payment processing failed');
        }
        return;
      }

      setValidSuccess(true);
      router.push('/success?accountAlreadyExists=' + accountAlreadyExists);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Payment processing failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='h-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-8">
            <div className="w-auto">
              <div className="font-inter mb-5 text-2xl font-semibold leading-[1.27] text-gray-900">
                {t('checkout.billing_details')}
              </div>
              <Separator />
              <UserInfo form={form} />
              <ServiceTypeSection service={service} />
              <>
                <div className="flex w-full gap-4">
                  <FormField
                    name="card_name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                          {t('checkout.cardName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 rounded-lg border border-gray-300 px-3.5 py-2.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="w-full flex-col gap-1.5">
                    <Label className="mb-1.5 text-sm font-medium leading-[20px] text-gray-700">
                      {t('checkout.expirationDate')}
                    </Label>
                    <CardExpiryElement
                      id="card_expiry"
                      className="mt-1.5 h-11 rounded-lg border border-gray-300 px-3.5 py-2.5"
                    />
                  </div>
                </div>
                <div className="mt-4 flex w-full gap-4">
                  <div className="w-full flex-col gap-1.5">
                    <Label className="text-sm font-medium leading-[20px] text-gray-700">
                      {t('checkout.cardNumber')}
                    </Label>
                    <CardNumberElement
                      id="card_number"
                      className="mt-1.5 h-11 rounded-lg border border-gray-300 px-3.5 py-2.5"
                    />
                  </div>
                  <div className="w-full flex-col gap-1.5">
                    <Label className="text-sm font-medium leading-[20px] text-gray-700">
                      {t('checkout.securityCode')}
                    </Label>
                    <CardCvcElement
                      id="card_cvc"
                      className="mt-1.5 h-11 rounded-lg border border-gray-300 px-3.5 py-2.5"
                    />
                  </div>
                </div>
              </>
            </div>
            <div className="flex flex-col justify-between">
              <SideInfo
                form={form}
                service={service}
                loading={loading}
                errorMessage={errorMessage ?? ''}
                accountId={stripeId}
                validSuccess={validSuccess}
              />
              <div className="flex flex-col items-center justify-center">
                <div className="mb-10">
                  <span className="text-center text-sm font-medium leading-[1.42857] text-gray-700">
                    {t('checkout.securePayment')}
                  </span>
                </div>
                <Separator className="w-full" />
                <div className="mt-10">
                  <img
                    src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/www.uk-cheapest.co%201.png?t=2024-11-06T14%3A53%3A58.386Z"
                    alt="Visa"
                    className="h-7 w-40"
                  />
                </div>
                <div>
                  <img
                    src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/powered_by_stripe.png?t=2024-11-06T14%3A55%3A53.278Z"
                    alt="Powered By Stripe"
                    className="h-12 w-40"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BillingForm;
