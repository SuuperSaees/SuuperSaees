import { Service } from '~/lib/services.types';
import convertToSubcurrency from '~/select-plan/components/convertToSubcurrency';
import { getUserByEmail } from '~/team-accounts/src/server/actions/clients/get/get-clients';
import { createSession } from '~/team-accounts/src/server/actions/sessions/create/create-sessions';


type ValuesProps = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  state_province_region: string;
  postal_code: string;
  buying_for_organization: boolean;
  enterprise_name: string;
  tax_code: string;
  discount_coupon: string;
  card_name: string;
};

type HandlePaymentProps = {
  service: Service.Type;
  values: ValuesProps;
  stripeId: string;
  organizationId: string;
  paymentMethodId: string;
  coupon: string;
  quantity?: number;
};

type HandlePaymentStripeProps = {
  service: Service.Type;
  values: ValuesProps;
  stripeId: string;
  organizationId: string;
  paymentMethodId: string;
  coupon: string;
  sessionId: string;
  quantity?: number;
};

export const handleRecurringPayment = async ({
  service,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  sessionId,
}: HandlePaymentStripeProps) => {
  const res = await fetch('/api/stripe/subscription-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: convertToSubcurrency(service.price ?? 0),
      recurrence: true,
      email: values.email,
      serviceId: service.id,
      priceId: service.price_id,
      accountId: stripeId,
      paymentMethodId,
      couponId: coupon,
      sessionId: sessionId,
    }),
  });

  const data = await res.clone().json();

  if (data.error) {
    console.error(data.error.message);
    throw new Error(data.error.message);
  }

  return data.clientSecret;
};

export const handleOneTimePayment = async ({
  service,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  sessionId,
  quantity,
}: HandlePaymentStripeProps) => {
  const res = await fetch('/api/stripe/unique-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: convertToSubcurrency(service.price ?? 0),
      email: values.email,
      currency: 'usd',
      accountId: stripeId,
      paymentMethodId,
      couponId: coupon,
      serviceId: service.id,
      sessionId: sessionId,
      quantity: quantity,
    }),
  });

  const data = await res.clone().json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.clientSecret;
};

export const handleSubmitPayment = async ({
  service,
  values,
  stripeId,
  organizationId,
  paymentMethodId,
  coupon,
  quantity,
}: HandlePaymentProps) => {
  try {

      const sessionCreated = await createSession({
        client_address: values.address,
        client_city: values.city,
        client_country: values.country,
        client_email: values.email,
        client_name: values.fullName,
        client_state: values.state_province_region,
        client_postal_code: values.postal_code,
        provider: 'suuper',
        provider_id: null,
      })

     service.recurrence
      ? await handleRecurringPayment({
          service,
          values,
          stripeId,
          organizationId,
          paymentMethodId,
          coupon,
          sessionId: sessionCreated?.id ?? '',
        })
      : await handleOneTimePayment({
          service,
          values,
          stripeId,
          organizationId,
          paymentMethodId,
          coupon,
          sessionId: sessionCreated?.id ?? '',
          quantity,
        });

        const userAlreadyExists = await getUserByEmail(values.email, true); 

        let accountAlreadyExists = false;
        if (userAlreadyExists?.userData?.id) {
          accountAlreadyExists = true
        }

    return { success: true, error: null, accountAlreadyExists };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
};