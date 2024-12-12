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
  MercadoPagoIcon,
  StripeIcon,
  WompiIcon,
  // EpaycoIcon,
  // PayuIcon,
  // PlaceToPayIcon,
  // OpenpayIcon,
  // PayuCoIcon,
  // PlaceToPayDirectIcon,
  // PaymentsWayIcon,
  // DlocalGoIcon,
  // PalomaIcon,
  // CoinkIcon,
  // PayzenIcon,
} from "~/components/icons/icons"
import { DollarSignIcon} from 'lucide-react';
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

import { Service } from '~/lib/services.types';
import { handleSubmitPayment } from '../utils/billing-handlers';
import { ServiceTypeSection } from './service-type-section';
import { SideInfo } from './side-information';
import { UserInfo } from './user-info'; 
import { toast } from 'sonner';

const paymentMethodsIcons = {
  mercadopago: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Mercado Pago</span>
    <MercadoPagoIcon  /></div>,
  stripedirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Stripe</span>
    <StripeIcon /></div>,
  wompidirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Wompi</span>
    <WompiIcon /></div>,
  epaycodirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Epayco</span>
    <DollarSignIcon /></div>,
  payudirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Payu</span>
    <DollarSignIcon /></div>,
  placetopay: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Place to pay</span>
    <DollarSignIcon /></div>,
  openpaydirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Openpay</span>
    <DollarSignIcon /></div>,
  payucodirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">PayuCo</span>
    <DollarSignIcon /></div>,
  placetopaydirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Place to pay</span>
    <DollarSignIcon /></div>,
  paymentswaydirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Payments way</span>
    <DollarSignIcon /></div>,
  dlocalgodirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">DlocalGo</span>
    <DollarSignIcon /></div>,
  palommadirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Paloma</span>
    <DollarSignIcon /></div>,
  coinkdirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Coink</span>
    <DollarSignIcon /></div>,
  payzendirect: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Payzen</span>
    <DollarSignIcon /></div>,
  stripe: <div >
    <span className="text-sm font-medium leading-[20px] text-gray-700">Stripe</span>
    <StripeIcon /></div>,
};


import { BillingAccounts } from '~/lib/billing-accounts.types';
const BillingForm: React.FC<{
  service: Service.Relationships.Billing.BillingService;
  stripeId: string;
  organizationId: string;
  logoUrl: string;
  sidebarBackgroundColor: string;
  paymentMethods?: BillingAccounts.PaymentMethod[];
}> = ({ service, stripeId, organizationId, logoUrl, sidebarBackgroundColor, paymentMethods }) => {
  const paymentMethodsImage = process.env.NEXT_PUBLIC_PAYMENT_METHODS_IMAGE;
  const poweredByStripeImage = process.env.NEXT_PUBLIC_POWERED_BY_STRIPE_IMAGE; 
  const { t } = useTranslation('services');
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(paymentMethods?.[0]?.name ?? '');

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [validSuccess, setValidSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const formSchema = z.object({
    fullName: z.string().min(1, t('checkout.validation.fullNameRequired')),
    email: z.string().email(t('checkout.validation.invalidEmail')),
    address: z.string().min(1, t('checkout.validation.addressRequired')),
    city: z.string().min(1, t('checkout.validation.cityRequired')),
    country: z.string().min(1, t('checkout.validation.countryRequired')),
    state_province_region: z.string().min(1, t('checkout.validation.stateProvinceRegionRequired')),
    postal_code: z.string().min(1, t('checkout.validation.postalCodeRequired')),
    buying_for_organization: z.boolean().default(false),
    enterprise_name: z.string(),
    tax_code: z.string(),
    discount_coupon: z.string(),
    card_name: z.string().min(0, t('checkout.validation.cardNameRequired')).optional(),
    card_number: z.string().min(0, t('checkout.validation.cardNumberRequired')).optional(),
    card_expiration_date: z.string().min(0, t('checkout.validation.cardExpirationDateRequired')).optional(),
    card_cvv: z.string().min(0, t('checkout.validation.cardCvvRequired')).optional(),
  });

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
      card_number: '',
      card_expiration_date: '',
      card_cvv: '',
    },
  });

  const handleCreateCard = async () => {
    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setErrorMessage(t('checkout.error.cardNumberElement'));
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
      const paymentMethod = await handleCreateCard() ?? {
        id: 'none',
      };

      if (!paymentMethod?.id) {
        throw new Error(t('checkout.error.paymentFailed'));
      }

      const { success, error, accountAlreadyExists, data } = await handleSubmitPayment({
        service,
        values: values,
        stripeId,
        organizationId,
        paymentMethodId: paymentMethod.id,
        coupon: values.discount_coupon,
        quantity: quantity,
        selectedPaymentMethod: selectedPaymentMethod,
      });

      if (!success) {
        if(error === 'User already registered'){
          toast.error(
            t('checkout.error.userAlreadyRegistered', {error})
          );
          setErrorMessage(error ?? 'Payment processing failed');
        } else {
          toast.error(
            t('checkout.error.paymentFailed', {error})
          );
          setErrorMessage(error ?? t('checkout.error.paymentFailed'));
        }
        return;
      }

      setValidSuccess(true);
      if(data?.paymentUrl){
        router.push(data.paymentUrl);
      } else {
        router.push('/success?accountAlreadyExists=' + accountAlreadyExists);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t('checkout.error.paymentFailed'),
      );
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="relative h-full w-full">
      <div 
        className="absolute top-0 left-0 w-full h-20" 
        style={{ backgroundColor: sidebarBackgroundColor }}
      />
      
      <div className='relative h-full w-full mx-auto flex flex-col justify-center items-center px-2 md:px-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-[1200px]">
            <div className="flex justify-start lg:justify-start mb-16 mt-4">
              <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain relative" />
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-[60%]">
                <div className="font-inter mb-5 text-2xl font-semibold leading-[1.27] text-gray-900">
                  {t('checkout.billing_details')}
                </div>
                <UserInfo form={form} />
                <ServiceTypeSection service={service} />
                <>
                  <div className="text-gray-900 font-inter text-base font-semibold leading-[2.375]">
                    {t('checkout.paymentMethod')}
                  </div>
                  <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {paymentMethods?.map((paymentMethod) => (
                      <div
                        key={paymentMethod.name}
                        className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === paymentMethod.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPaymentMethod(paymentMethod.name)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {paymentMethodsIcons[paymentMethod.icon as keyof typeof paymentMethodsIcons]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                 {
                  selectedPaymentMethod !== 'mercadopago' && (
                    <div className="flex flex-col sm:flex-row w-full gap-4">
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
                  )
                } 
                 {
                  selectedPaymentMethod !== 'mercadopago' && (
                    <div className="mt-4 flex flex-col sm:flex-row w-full gap-4">
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
                  )
                 }
                </>
              </div> 
              <div className="w-full lg:w-[40%] flex flex-col justify-between">
                <SideInfo
                  form={form}
                  service={service}
                  loading={loading}
                  errorMessage={errorMessage ?? ''}
                  accountId={stripeId}
                  validSuccess={validSuccess}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  selectedPaymentMethod={selectedPaymentMethod}
                />
                <div className="flex flex-col items-center justify-center mt-6 lg:mt-0">
                  <div className="mb-10">
                    <span className="text-center text-sm font-medium leading-[1.42857] text-gray-700">
                      {t('checkout.securePayment')}
                    </span>
                  </div>
                  <Separator className="w-full" />
                  <div className="mt-10">
                    <img
                      src={paymentMethodsImage}
                      alt="Visa"
                      className="h-7 w-40"
                    />
                  </div>
                  <div>
                    <img
                      src={poweredByStripeImage}
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
    </div>
  );
};

export default BillingForm;
