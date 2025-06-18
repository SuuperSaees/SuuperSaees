'use server';
import { getUserByEmail } from '~/team-accounts/src/server/actions/clients/get/get-clients';
import { createSession } from '~/team-accounts/src/server/actions/sessions/create/create-sessions';
import { handleRecurringPayment, handleOneTimePayment } from './billing-handlers';
import { Service } from '~/lib/services.types';

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
    const metadata = {
      manual_payment_info: '',
      discount_coupon: '',
    };
    
    if (selectedPaymentMethod === 'manual_payment' && values.manual_payment_info) {
      metadata.manual_payment_info = values.manual_payment_info;
    }
    
    if (values.discount_coupon) {
      metadata.discount_coupon = values.discount_coupon;
    }

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
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    const responseRecurringOrOneTimePayment = service.recurring_subscription
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

    const accountAlreadyExists = userAlreadyExists?.userData?.id ? true : false;

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