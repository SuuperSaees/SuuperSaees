'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Service } from '~/lib/services.types';
import { Invoice } from '~/lib/invoice.types';
import convertToSubcurrency from '~/(main)/select-plan/components/convertToSubcurrency';
import { TreliCredentials, CredentialsCrypto, EncryptedCredentials } from '~/utils/credentials-crypto';
import { createCheckout } from '../../server/actions/checkouts/checkouts.action';
import { processManualPayment } from '../../server/actions/invoice-payments/invoice-payments.action';

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
  manual_payment_info?: string;
};

type HandlePaymentStripeProps = {
  service: Service.Relationships.Billing.BillingService;
  values: ValuesProps;
  stripeId: string;
  paymentMethodId: string;
  coupon: string;
  sessionId: string;
  quantity?: number;
  selectedPaymentMethod: string;
  baseUrl: string;
};

const calculateTrialDays = (service: Service.Relationships.Billing.BillingService): number => {
  if (!service.test_period || !service.test_period_duration) {
    return 0;
  }

  const duration = service.test_period_duration;
  const unit = service.test_period_duration_unit_of_measurement?.toLowerCase() ?? '';

  if (!unit) return 0;

  // Verificar la unidad de medida usando includes() para mayor flexibilidad
  if (unit.includes('day')) {
    return duration;
  }
  if (unit.includes('week')) {
    return duration * 7;
  }
  if (unit.includes('month')) {
    return duration * 30;
  }
  if (unit.includes('year')) {
    return duration * 365;
  }

  return 0;
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
  // here manage payment method
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
        trialPeriodDays: calculateTrialDays(service),
      }),
    });

    const data = await res.clone().json();

    if (data.error) {
      console.error(data.error.message);
      throw new Error(data.error.message);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data.clientSecret;
  } else if(selectedPaymentMethod === 'manual_payment') {
    try {
      // Solo crear checkout con servicio - el webhook se encargará del resto
      const checkout = await createCheckout({
        provider: 'suuper',
        provider_id: sessionId,
        service_id: service.id,
      });

      return {
        success: true,
        checkout: checkout,
        message: 'Manual payment checkout created successfully',
      };
    } catch (error) {
      console.error('Error creating manual payment checkout:', error);
      throw new Error(`Failed to create manual payment checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else  {
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
      credentialsCrypto.decrypt<TreliCredentials>(parsedCredentials);

    // Create Basic Auth token
    const authToken = Buffer.from(
      `${credentials.treli_user}:${credentials.treli_password}`,
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
        // Only include card details if not using Mercado Pago
        ...(selectedPaymentMethod !== 'mercadopago' && {
          cardNumber: values.card_number,
          month: values.card_expiration_date?.split('/')[0],
          year: values.card_expiration_date?.split('/')[1],
          cardCvc: values.card_cvv,
        }),
      },
      payment_method: selectedPaymentMethod,
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
        trialPeriodDays: calculateTrialDays(service),
      }),
    });

    const data = await res.clone().json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data.clientSecret;
  } else if(selectedPaymentMethod === 'manual_payment') {
    try {
      // Solo crear checkout con servicio - el webhook se encargará del resto
      const checkout = await createCheckout({
        provider: 'suuper',
        provider_id: sessionId,
        service_id: service.id,
      });

      return {
        success: true,
        checkout: checkout,
        message: 'Manual payment checkout created successfully',
      };
    } catch (error) {
      console.error('Error creating manual payment checkout:', error);
      throw new Error(`Failed to create manual payment checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      credentialsCrypto.decrypt<TreliCredentials>(parsedCredentials);

    // Create Basic Auth token
    const authToken = Buffer.from(
      `${credentials.treli_user}:${credentials.treli_password}`,
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
        // Only include card details if not using Mercado Pago
        ...(selectedPaymentMethod !== 'mercadopago' && {
          cardNumber: values.card_number,
          month: values.card_expiration_date?.split('/')[0],
          year: values.card_expiration_date?.split('/')[1],
          cardCvc: values.card_cvv,
        }),
      },
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return dataSubscriptionPlan;
  }
};

type HandleInvoicePaymentProps = {
  invoice: Invoice.Response;
  values: ValuesProps;
  stripeId: string;
  paymentMethodId: string;
  coupon: string;
  sessionId: string;
  selectedPaymentMethod: string;
  baseUrl: string;
};

export const handleInvoicePayment = async ({
  invoice,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  sessionId,
  selectedPaymentMethod,
  baseUrl,
}: HandleInvoicePaymentProps) => {
  // Validar que la invoice tenga provider_id si el método de pago es stripe
  if (selectedPaymentMethod === 'stripe') {
    if (!invoice.provider_id || invoice.provider_id.trim() === '') {
      throw new Error('Invoice cannot be paid with Stripe as it has no provider_id');
    }

    const res = await fetch(`${baseUrl}/api/stripe/invoice-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        stripeInvoiceId: invoice.provider_id,
        email: values.email,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  } else if (selectedPaymentMethod === 'manual_payment') {
    try {
      // Procesar pago manual para la invoice
      const payment = await processManualPayment(invoice.id, {
        amount: invoice.total_amount ?? 0,
        paymentMethod: 'manual',
        notes: values.manual_payment_info,
        referenceNumber: sessionId,
      });

      return {
        success: true,
        payment: payment,
        message: 'Manual payment processed successfully for invoice',
      };
    } catch (error) {
      console.error('Error processing manual payment for invoice:', error);
      throw new Error(`Failed to process manual payment for invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    throw new Error(`Payment method ${selectedPaymentMethod} not supported for invoice payments`);
  }
};