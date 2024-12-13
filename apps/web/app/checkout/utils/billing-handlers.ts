'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Service } from '~/lib/services.types';
import convertToSubcurrency from '~/select-plan/components/convertToSubcurrency';
import { getUserByEmail } from '~/team-accounts/src/server/actions/clients/get/get-clients';
import { createSession } from '~/team-accounts/src/server/actions/sessions/create/create-sessions';



import { Credentials, CredentialsCrypto, EncryptedCredentials } from '../../../../../apps/web/app/utils/credentials-crypto';


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
  card_name?: string;
  card_number?: string;
  card_expiration_date?: string;
  card_cvv?: string;
};

type HandlePaymentProps = {
  service: Service.Relationships.Billing.BillingService;
  values: ValuesProps;
  stripeId: string;
  organizationId: string;
  paymentMethodId: string;
  coupon: string;
  quantity?: number;
  selectedPaymentMethod: string;
  baseUrl: string;
};

type HandlePaymentStripeProps = {
  service: Service.Relationships.Billing.BillingService;
  values: ValuesProps;
  stripeId: string;
  organizationId: string;
  paymentMethodId: string;
  coupon: string;
  sessionId: string;
  quantity?: number;
  selectedPaymentMethod: string;
  baseUrl: string;
};

export const handleRecurringPayment = async ({
  service,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  sessionId,
  selectedPaymentMethod,
  baseUrl,
}: HandlePaymentStripeProps) => {
  // heree manage payment method
  if (selectedPaymentMethod === 'stripe') {
    const res = await fetch(`${baseUrl}/api/stripe/subscription-payment`, {
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
  } else {
    // here manage payment method treli
    const client = getSupabaseServerComponentClient({
      admin: true,
    });
    const { data: billingAccount, error: billingAccountError } = await client
      .from('billing_accounts')
      .select('credentials')
      .eq('account_id', service.propietary_organization_id ?? '')
      .eq('provider', 'treli')
      .single();

    if (billingAccountError) {
      console.error(billingAccountError.message);
      throw new Error(billingAccountError.message);
    }
    const secretKey = Buffer.from(
      process.env.CREDENTIALS_SECRET_KEY ?? '',
      'hex',
    );
    const credentialsCrypto = new CredentialsCrypto(secretKey);
    const parsedCredentials: EncryptedCredentials = JSON.parse(
      billingAccount.credentials as string,
    );
    if (
      !parsedCredentials.data ||
      !parsedCredentials.iv ||
      !parsedCredentials.version ||
      !parsedCredentials.tag
    ) {
      console.error('Invalid encrypted credentials');
      return { success: false };
    }
    const credentials =
      credentialsCrypto.decrypt<Credentials>(parsedCredentials);

    // Create Basic Auth token
    const authToken = Buffer.from(
      `${credentials.username}:${credentials.password}`,
    ).toString('base64');

    const subscriptionPlan = {
      email: values.email,
      currency: service.currency,
      billing_address: {
        first_name: values.fullName.split(' ')[0],
        last_name: values.fullName.split(' ').slice(1).join(' '),
        cedula: values.tax_code ? parseInt(values.tax_code) : undefined,
        address_1: values.address,
        city: values.city,
        state: values.state_province_region,
        postcode: values.postal_code,
        country: values.country,
        company: values.buying_for_organization
          ? values.enterprise_name
          : undefined,
        phone: 1, // Need to add phone to ValuesProps if required
        id_type: 'CC', // Default to CC, might need to be configurable
      },
      products: [
        {
          id:
            service.billing_services.find(
              (billingService) => billingService.provider === 'treli',
            )?.provider_id ?? '',
          quantity: 1,
          subscription_period_interval: 1,
          subscription_period: service.recurrence ? 'month' : 'one-time', // Adjust based on your service configuration
          subscription_price: convertToSubcurrency(service.price ?? 0),
          subscription_length: undefined, // Indefinite duration
        },
      ],
      payment: {
        coupon_code: coupon || undefined,
        payment_collection: 'false',
        payment_invoicing: 'create',
      },
      // Only include card details if not using Mercado Pago
      ...(selectedPaymentMethod !== 'mercadopago' && {
        cardNumber: values.card_number,
        month: values.card_expiration_date?.split('/')[0],
        year: values.card_expiration_date?.split('/')[1],
        cardCvc: values.card_cvv,
      }),
      requires_shipping: false,
      manual_payment: selectedPaymentMethod === 'mercadopago',
      block_billing_change: true,
    };

    const responseSubscriptionPlan = await fetch(
      'https://treli.co/wp-json/api/subscriptions/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authToken}`,
        },
        body: JSON.stringify(subscriptionPlan),
      },
    );

    if (!responseSubscriptionPlan.ok) {
      const errorData = await responseSubscriptionPlan.clone().json();
      console.error(errorData);
      throw new Error(errorData.message);
    }

    const dataSubscriptionPlan = (await responseSubscriptionPlan
      .clone()
      .json()) as {
      response_code: number;
      payment_id: number;
      subscription_ids: number[];
      payment_url: string;
      message: string;
    };

    return dataSubscriptionPlan;
  }
};

export const handleOneTimePayment = async ({
  service,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  sessionId,
  quantity,
  selectedPaymentMethod,
  baseUrl,
}: HandlePaymentStripeProps) => {
  if (selectedPaymentMethod === 'stripe') {
    const res = await fetch(`${baseUrl}/api/stripe/unique-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: convertToSubcurrency(service.price ?? 0),
        email: values.email,
        currency: service.currency,
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
  } else {
    // here manage payment method treli
    const client = getSupabaseServerComponentClient({
      admin: true,
    });
    const { data: billingAccount, error: billingAccountError } = await client
      .from('billing_accounts')
      .select('credentials')
      .eq('account_id', service.propietary_organization_id ?? '')
      .eq('provider', 'treli')
      .single();

    if (billingAccountError) {
      console.error(billingAccountError.message);
      throw new Error(billingAccountError.message);
    }
    const secretKey = Buffer.from(
      process.env.CREDENTIALS_SECRET_KEY ?? '',
      'hex',
    );
    const credentialsCrypto = new CredentialsCrypto(secretKey);
    const parsedCredentials: EncryptedCredentials = JSON.parse(
      billingAccount.credentials as string,
    );
    if (
      !parsedCredentials.data ||
      !parsedCredentials.iv ||
      !parsedCredentials.version ||
      !parsedCredentials.tag
    ) {
      console.error('Invalid encrypted credentials');
      return { success: false };
    }
    const credentials =
      credentialsCrypto.decrypt<Credentials>(parsedCredentials);

    // Create Basic Auth token
    const authToken = Buffer.from(
      `${credentials.username}:${credentials.password}`,
    ).toString('base64');

    const subscriptionPlan = {
      email: values.email,
      currency: service.currency,
      billing_address: {
        first_name: values.fullName.split(' ')[0],
        last_name: values.fullName.split(' ').slice(1).join(' '),
        cedula: values.tax_code ? parseInt(values.tax_code) : undefined,
        address_1: values.address,
        city: values.city,
        state: values.state_province_region,
        postcode: values.postal_code,
        country: values.country,
        company: values.buying_for_organization
          ? values.enterprise_name
          : undefined,
        phone: undefined, // Need to add phone to ValuesProps if required
        id_type: 'CC', // Default to CC, might need to be configurable
      },
      products: [
        {
          id: service.id,
          quantity: 1,
          subscription_period_interval: 1,
          subscription_period: service.recurrence ? 'month' : 'one-time', // Adjust based on your service configuration
          subscription_price: convertToSubcurrency(service.price ?? 0),
          subscription_length: undefined, // Indefinite duration
        },
      ],
      payment: {
        coupon_code: coupon || undefined,
        payment_collection: 'false',
        payment_invoicing: 'create',
      },
      // Only include card details if not using Mercado Pago
      ...(selectedPaymentMethod !== 'mercadopago' && {
        cardNumber: values.card_number,
        month: values.card_expiration_date.split('/')[0],
        year: values.card_expiration_date.split('/')[1],
        cardCvc: values.card_cvv,
      }),
      requires_shipping: false,
      manual_payment: false,
      block_billing_change: true,
    };

    const responseSubscriptionPlan = await fetch(
      'https://treli.co/wp-json/api/subscriptions/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authToken}`,
        },
        body: JSON.stringify(subscriptionPlan),
      },
    );

    if (!responseSubscriptionPlan.ok) {
      const errorData = await responseSubscriptionPlan.clone().json();
      console.error(errorData);
      throw new Error(errorData.message);
    }

    const dataSubscriptionPlan = await responseSubscriptionPlan.clone().json();

    console.log(dataSubscriptionPlan);
    return dataSubscriptionPlan;
  }
};

export const handleSubmitPayment = async ({
  service,
  values,
  stripeId,
  organizationId,
  paymentMethodId,
  coupon,
  quantity,
  selectedPaymentMethod,
  baseUrl,
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
    });

    const responseRecurringOrOneTimePayment = service.recurrence
      ? await handleRecurringPayment({
          service,
          values,
          stripeId,
          organizationId,
          paymentMethodId,
          coupon,
          sessionId: sessionCreated?.id ?? '',
          selectedPaymentMethod,
          baseUrl,
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
          selectedPaymentMethod,
          baseUrl,
        });

    const userAlreadyExists = await getUserByEmail(values.email, true);

    let accountAlreadyExists = false;
    if (userAlreadyExists?.userData?.id) {
      accountAlreadyExists = true;
    }

    return {
      success: true,
      error: null,
      accountAlreadyExists,
      data: {
        paymentUrl: responseRecurringOrOneTimePayment?.payment_url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
};