'use server';
import { getUserByEmail } from '~/team-accounts/src/server/actions/clients/get/get-clients';
import { createSession } from '~/team-accounts/src/server/actions/sessions/create/create-sessions';
import { handleRecurringPayment, handleOneTimePayment, handleInvoicePayment } from './billing-handlers';
import { Service } from '~/lib/services.types';
import { Invoice } from '~/lib/invoice.types';

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
  service?: Service.Relationships.Billing.BillingService;
  invoice?: Invoice.Response;
  values: ValuesProps;
  stripeId: string;
  paymentMethodId: string;
  coupon: string;
  quantity?: number;
  selectedPaymentMethod: string;
  baseUrl: string;
};

export const handleSubmitPayment = async ({
  service,
  invoice,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  quantity,
  selectedPaymentMethod,
  baseUrl,
}: HandlePaymentProps) => {
  try {
    // Validar que se proporcione service o invoice, pero no ambos
    if ((!service && !invoice) || (service && invoice)) {
      return {
        success: false,
        error: 'Must provide either service or invoice, but not both',
      };
    }

    const metadata = {
      manual_payment_info: '',
      discount_coupon: '',
      type: service ? 'service' : 'invoice', // Add type based on whether it's a service or invoice
    };

    if (selectedPaymentMethod === 'manual_payment' && values.manual_payment_info) {
      metadata.manual_payment_info = values.manual_payment_info;
    } else if( selectedPaymentMethod === 'manual_payment' && !values.manual_payment_info) {
      const error = new Error('Manual payment info is required when using manual payment method');
      return {
        success: false,
        error: error.message,
      }
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

    let responsePayment;

    // Manejar pagos de invoices
    if (invoice) {
      try {
        responsePayment = await handleInvoicePayment({
          invoice,
          values,
          stripeId,
          paymentMethodId,
          coupon,
          sessionId: sessionCreated?.id ?? '',
          selectedPaymentMethod,
          baseUrl,
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process invoice payment',
        };
      }
    }
    // Manejar pagos de services (lógica existente)
    else if (service) {
      try {
        responsePayment = service.recurring_subscription
          ? await handleRecurringPayment({
              service,
              values,
              stripeId,
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
              paymentMethodId,
              coupon,
              sessionId: sessionCreated?.id ?? '',
              quantity,
              selectedPaymentMethod,
              baseUrl,
            });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process service payment',
        };
      }
    }

    const userAlreadyExists = await getUserByEmail(values.email, true);

    const accountAlreadyExists = userAlreadyExists?.userData?.id ? true : false;

    return {
      success: true,
      error: null,
      accountAlreadyExists,
      data: {
        paymentUrl: responsePayment?.payment_url,
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