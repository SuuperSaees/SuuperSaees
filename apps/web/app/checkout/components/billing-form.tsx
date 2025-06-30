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
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  CustomFormLabel,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Spinner } from '@kit/ui/spinner';

import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Service } from '~/lib/services.types';

import { handleSubmitPayment } from '../utils/handle-submit-payment';
import { SideInfo } from './side-information';
import { UserInfo } from './user-info';
import { Invoice } from '~/lib/invoice.types';
import { paymentMethodsIcons } from '../utils/payment-methods-icons';

const BillingForm: React.FC<{
  service?: Service.Relationships.Billing.BillingService;
  invoice?: Invoice.Response;
  stripeId: string;
  logoUrl: string;
  sidebarBackgroundColor: string;
  paymentMethods?: BillingAccounts.PaymentMethod[];
  manualPayment?: BillingAccounts.PaymentMethod;
}> = ({
  service,
  invoice,
  stripeId,
  logoUrl,
  sidebarBackgroundColor,
  paymentMethods,
  manualPayment,
}) => {
  const { t } = useTranslation('services');
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    paymentMethods?.[0]?.name ?? '',
  );

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [validSuccess, setValidSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cardType, setCardType] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const formSchema = z.object({
    fullName: z.string().min(1, t('checkout.validation.fullNameRequired')),
    email: z.string().email(t('checkout.validation.invalidEmail')),
    address: z.string().min(1, t('checkout.validation.addressRequired')),
    city: z.string().min(1, t('checkout.validation.cityRequired')),
    country: z.string().min(1, t('checkout.validation.countryRequired')),
    state_province_region: z
      .string()
      .min(1, t('checkout.validation.stateProvinceRegionRequired')),
    postal_code: z.string().min(1, t('checkout.validation.postalCodeRequired')),
    buying_for_organization: z.boolean().default(false),
    enterprise_name: z.string(),
    tax_code: z.string(),
    discount_coupon: z.string(),
    card_name: z.string().min(1, t('checkout.validation.cardNameRequired')),
    card_number: z
      .string()
      .regex(/^\d{16}$/, t('checkout.validation.cardNumberRequired')),
    card_expiration_date: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim().replace(/\s+/g, '') : val),
      z
        .string()
        .regex(
          /^(0[1-9]|1[0-2])\/\d{2}$/,
          t('checkout.validation.cardExpirationDateRequired'),
        ),
    ),
    card_cvv: z
      .string()
      .regex(/^\d{3,4}$/, t('checkout.validation.cardCvvRequired')),
    manual_payment_info: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: invoice ? invoice.client?.owner?.name ?? '' : '',
      email: invoice ? invoice.client?.owner?.email ?? '' : '',
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
      manual_payment_info: '',
    },
  });

  const handleCardTypeChange = (cardNumber: string) => {
    const bin = cardNumber.replace(/\D/g, '').substring(0, 6);

    if (bin.startsWith('4')) {
      setCardType('visa');
    } else if (
      /^5[1-5]/.test(bin) ||
      /^222[1-9]|^22[3-9]\d|^2[3-6]\d{2}|^27[01]\d|^2720/.test(bin)
    ) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(bin)) {
      setCardType('amex');
    } else if (bin.startsWith('6')) {
      setCardType('discover');
    } else {
      setCardType(null);
    }
  };

  const handleCreateCard = async () => {
    if (!stripe || !elements) {
      return;
    }

    let paymentMethodId = '';

    if (selectedPaymentMethod === 'stripe') {

    const cardNumberElement = elements.getElement(CardNumberElement);

    if (!cardNumberElement) {
      setErrorMessage('Card number element is not initialized');
      return null;
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
      toast.error(t('checkout.error.paymentFailed'));
      return null;
    }

    setErrorMessage('');

    if (!paymentMethod?.id) {
      throw new Error(t('checkout.error.paymentFailed'));
    }
    paymentMethodId = paymentMethod.id;
    }

    const { success, error, accountAlreadyExists, data } =
      await handleSubmitPayment({
        service,
        invoice,
        values: form.getValues(),
        stripeId,
        paymentMethodId: paymentMethodId,
        coupon: form.getValues('discount_coupon'),
        quantity: quantity,
        selectedPaymentMethod: selectedPaymentMethod,
        baseUrl,
      });

      if (!success) {
        if (error === 'User already registered') {
          toast.error(t('checkout.error.userAlreadyRegistered', { error }));
          setErrorMessage(error ?? 'Payment processing failed');
        } else {
          toast.error(t('checkout.error.paymentFailed', { error }));
          setErrorMessage(error ?? t('checkout.error.paymentFailed'));
        }
        return;
      }

      setValidSuccess(true);
      if (data?.paymentUrl) {
        router.push(data.paymentUrl);
      } else {
        router.push(
          `${baseUrl}/success?accountAlreadyExists=${accountAlreadyExists}`,
        );
      }

  };

  async function onSubmit() {
    setLoading(true);
    setValidSuccess(false);
    try {
      await handleCreateCard()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('checkout.error.paymentFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mt-6 h-full w-full">
      <div
        className="absolute left-0 top-0 h-20 w-full"
        style={{ backgroundColor: sidebarBackgroundColor }}
      />
      <div className="relative mx-auto flex h-full w-full flex-col items-center justify-center px-2 md:px-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-[1200px] space-y-4"
          >
            <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 lg:flex-row" style={{flexFlow: 'wrap-reverse'}}>
              {/* Columna izquierda */}
              <div className="flex-1 rounded-lg bg-white p-6 shadow-md">
                <UserInfo form={form} />
                <>
                  <div className="font-inter mt-5 text-base font-semibold leading-[2.375] text-gray-900">
                    {t('checkout.paymentMethod')}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {paymentMethods?.map((paymentMethod) => (
                        <div
                          key={paymentMethod.name}
                          className={`flex cursor-pointer items-center justify-center rounded-lg border p-4 transition-all ${
                            selectedPaymentMethod === paymentMethod.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            padding: '10.3px 14.42px',
                            maxHeight: '45.6px',
                            maxWidth: '88.84px',
                          }}
                          onClick={() =>
                            setSelectedPaymentMethod(paymentMethod.name)
                          }
                        >
                          <div className="flex flex-col items-center gap-2">
                            {
                              paymentMethodsIcons[
                                paymentMethod.icon as keyof typeof paymentMethodsIcons
                              ]
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedPaymentMethod !== 'manual_payment' ? (<div className="mt-6 flex w-full flex-col gap-6">
                    {/* Nombre en la tarjeta */}
                    <div className="w-full flex-col gap-1.5">
                      <FormField
                        name="card_name"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <CustomFormLabel
                              label={t('checkout.cardName')}
                              required={true}
                              textSize="text-[14px]"
                              textColor="text-[#747476]"
                            />
                            <FormControl>
                              <Input
                                className="rounded-lg border border-gray-300 px-3.5 py-2.5"
                                {...field}
                                placeholder={t('checkout.cardName')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Número de tarjeta, Fecha de expiración y CVV */}
                    <div className="flex w-full flex-col gap-4 sm:flex-row">
                      {/* Número de tarjeta */}
                      <div className="sm:w- relative w-full flex-col gap-1.5">
                        {selectedPaymentMethod === 'stripe' ? (
                          <>
                            <CustomFormLabel
                              label={t('checkout.cardNumber')}
                              required={true}
                              textSize="text-[14px]"
                              textColor="text-[#747476]"
                            />
                            <CardNumberElement
                              id="card_number"
                              className="mt-1.5 rounded-lg border border-gray-300 px-3.5 py-2.5"
                              options={{ showIcon: true }}
                            />
                          </>
                        ) : (
                          <FormField
                            name="card_number"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <CustomFormLabel
                                  label={t('checkout.cardNumber')}
                                  required={true}
                                  textSize="text-[14px]"
                                  textColor="text-[#747476]"
                                />
                                <FormControl>
                                  <div className="relative w-full">
                                    <Input
                                      type="text"
                                      className="rounded-lg border border-gray-300 px-3.5 py-2.5"
                                      {...field}
                                      placeholder="4242 4242 4242 4242"
                                      onChange={(e) => {
                                        const value = e.target.value.replace(
                                          /\D/g,
                                          '',
                                        );
                                        field.onChange(value);
                                        handleCardTypeChange(value);
                                      }}
                                      maxLength={19}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 transform">
                                      {cardType && (
                                        <img
                                          src={`/images/services/${cardType}.png`}
                                          alt={cardType}
                                          className="h-6 w-10 object-contain"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Fecha de expiración */}
                      <div className="w-full flex-col gap-1.5 sm:w-1/2">
                        {selectedPaymentMethod === 'stripe' ? (
                          <>
                            <CustomFormLabel
                              label={t('checkout.expirationDate')}
                              required={true}
                              textSize="text-[14px]"
                              textColor="text-[#747476]"
                            />
                            <CardExpiryElement
                              id="card_expiry"
                              className="mt-1.5 rounded-lg border border-gray-300 px-3.5 py-2.5"
                              options={{ placeholder: 'MM / YY' }}
                            />
                          </>
                        ) : (
                          <FormField
                            name="card_expiration_date"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <CustomFormLabel
                                  label={t('checkout.expirationDate')}
                                  required={true}
                                  textSize="text-[14px]"
                                  textColor="text-[#747476]"
                                />
                                <FormControl>
                                  <Input
                                    className="rounded-lg border border-gray-300 px-3.5 py-2.5"
                                    {...field}
                                    placeholder="MM / YY"
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        /\D/g,
                                        '',
                                      );
                                      let formattedValue = value;

                                      if (value.length >= 2) {
                                        const month = parseInt(
                                          value.slice(0, 2),
                                          10,
                                        );
                                        if (month < 1 || month > 12) {
                                          return;
                                        }

                                        formattedValue = `${value.slice(0, 2)} / `;
                                      }

                                      if (value.length > 2) {
                                        formattedValue = `${value.slice(0, 2)} / ${value.slice(2, 4)}`;
                                      }

                                      field.onChange(formattedValue);
                                    }}
                                    maxLength={7}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* CVV */}
                      <div className="w-full flex-col gap-1.5 sm:w-1/2">
                        {selectedPaymentMethod === 'stripe' ? (
                          <>
                            <CustomFormLabel
                              label={t('checkout.securityCode')}
                              required={true}
                              textSize="text-[14px]"
                              textColor="text-[#747476]"
                            />
                            <CardCvcElement
                              id="card_cvc"
                              className="mt-1.5 rounded-lg border border-gray-300 px-3.5 py-2.5"
                              options={{ placeholder: '123' }}
                            />
                          </>
                        ) : (
                          <FormField
                            name="card_cvv"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <CustomFormLabel
                                  label={t('checkout.securityCode')}
                                  required={true}
                                  textSize="text-[14px]"
                                  textColor="text-[#747476]"
                                />
                                <FormControl>
                                  <Input
                                    className="rounded-lg border border-gray-300 px-3.5 py-2.5"
                                    {...field}
                                    placeholder="123"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>) :
                  
                    (<div className="mt-6 space-y-6">
                      {/* Información de pago manual */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="font-inter mb-3 text-lg font-semibold text-gray-900">
                          {t('checkout.manualPayment.title', 'Pago Manual')}
                          
                        </h3>

                           <span>{manualPayment?.custom_name}</span>
                        <div className="rounded-md bg-white p-3">
                          <div 
                            className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ 
                              __html: manualPayment?.description?.replace(/\n/g, '<br>') ?? ''
                            }}
                          />
                        </div>
                      </div>

                      {/* Field for additional user information */}
                      <div className="w-full">
                        <FormField
                          name="manual_payment_info"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <CustomFormLabel
                                label={t('checkout.manualPayment.additionalInfo', 'Información Adicional')}
                                required={false}
                                textSize="text-[14px]"
                                textColor="text-[#747476]"
                              />
                              <FormControl>
                                <textarea
                                  className="w-full min-h-[100px] rounded-lg border border-gray-300 px-3.5 py-2.5 resize-vertical"
                                  {...field}
                                  placeholder={t('checkout.manualPayment.placeholder', 'Ingresa cualquier información adicional sobre tu pago, número de transacción, comentarios, etc.')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>)}
                </>
                <div className="mt-8">
                  <ThemedButton
                    type="submit"
                    disabled={loading}
                    className="w-full transform transition duration-300 ease-in-out hover:scale-105"
                    onClick={onSubmit}
                  >
                    {service?.test_period ? t('checkout.trial.subscribe') : service?.recurring_subscription ? t('checkout.subscribe') : t('checkout.pay')}
                    {loading && <Spinner className="ml-2 h-4 w-4" />}
                  </ThemedButton>
                </div>
              </div>
              <div
                className="rounded-lg p-6 lg:w-[40%]"
                style={{ backgroundColor: sidebarBackgroundColor }}
              >
                <div className="mb-8 flex items-start justify-start">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="justify-start"
                    style={{
                      width: '160px',
                      height: 'auto',
                    }}
                  />
                </div>
                <SideInfo
                  form={form}
                  service={service}
                  invoice={invoice}
                  loading={loading}
                  errorMessage={errorMessage ?? ''}
                  accountId={stripeId}
                  validSuccess={validSuccess}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onSubmit={onSubmit}
                  sidebarBackgroundColor={sidebarBackgroundColor}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BillingForm;