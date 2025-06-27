/**
 * Example of using invoice-compatible checkout
 * 
 * This file shows how to use the new checkout functionality
 * that supports both services and invoices.
 */

import { handleSubmitPayment } from './handle-submit-payment';
import { getInvoice } from '../../server/actions/invoices/invoices.action';
import { Service } from '~/lib/services.types';
import { Invoice } from '~/lib/invoice.types';

// Example 1: Service Payment (existing functionality)
async function payService(service: Service.Relationships.Billing.BillingService, formData: any) {
  try {
    const result = await handleSubmitPayment({
      service, // Only service, NO invoice
      values: {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        state_province_region: formData.state,
        postal_code: formData.postalCode,
        buying_for_organization: formData.isOrganization,
        enterprise_name: formData.companyName,
        tax_code: formData.taxCode,
        discount_coupon: formData.couponCode,
        manual_payment_info: formData.manualPaymentInfo, // Only for manual payments
      },
      stripeId: 'acct_1234567890',
      paymentMethodId: 'pm_1234567890',
      coupon: formData.couponCode,
      quantity: 1,
      selectedPaymentMethod: 'stripe', // 'stripe', 'manual_payment', 'mercadopago', etc.
      baseUrl: 'https://myapp.com',
    });

    if (result.success) {
      console.log('Service payment successful:', result.data.paymentUrl);
    } else {
      console.error('Service payment failed:', result.error);
    }
  } catch (error) {
    console.error('Error processing service payment:', error);
  }
}

// Example 2: Invoice Payment with Stripe
async function payInvoiceWithStripe(invoiceId: string, formData: any) {
  try {
    // First get the invoice
    const invoice = await getInvoice(invoiceId);
    
    // Validate that the invoice has provider_id for Stripe
    if (!invoice.provider_id || invoice.provider_id.trim() === '') {
      throw new Error('Invoice cannot be paid with Stripe as it has no provider_id');
    }

    const result = await handleSubmitPayment({
      invoice, // Only invoice, NO service
      values: {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        state_province_region: formData.state,
        postal_code: formData.postalCode,
        buying_for_organization: formData.isOrganization,
        enterprise_name: formData.companyName,
        tax_code: formData.taxCode,
        discount_coupon: formData.couponCode,
      },
      stripeId: 'acct_1234567890',
      paymentMethodId: 'pm_1234567890',
      coupon: formData.couponCode,
      selectedPaymentMethod: 'stripe',
      baseUrl: 'https://myapp.com',
    });

    if (result.success) {
      console.log('Invoice payment successful:', result.data.paymentUrl);
    } else {
      console.error('Invoice payment failed:', result.error);
    }
  } catch (error) {
    console.error('Error processing invoice payment:', error);
  }
}

// Example 3: Manual Invoice Payment
async function payInvoiceManually(invoiceId: string, formData: any) {
  try {
    // Get the invoice
    const invoice = await getInvoice(invoiceId);

    const result = await handleSubmitPayment({
      invoice, // Only invoice, NO service
      values: {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        state_province_region: formData.state,
        postal_code: formData.postalCode,
        buying_for_organization: formData.isOrganization,
        enterprise_name: formData.companyName,
        tax_code: formData.taxCode,
        discount_coupon: formData.couponCode,
        manual_payment_info: formData.manualPaymentInfo, // REQUIRED for manual payments
      },
      stripeId: '', // Not needed for manual payments
      paymentMethodId: '', // Not needed for manual payments
      coupon: formData.couponCode,
      selectedPaymentMethod: 'manual_payment',
      baseUrl: 'https://myapp.com',
    });

    if (result.success) {
      console.log('Manual invoice payment processed:', result);
    } else {
      console.error('Manual invoice payment failed:', result.error);
    }
  } catch (error) {
    console.error('Error processing manual invoice payment:', error);
  }
}

// Example 4: Universal Checkout React Component
interface UniversalCheckoutProps {
  service?: Service.Relationships.Billing.BillingService;
  invoice?: Invoice.Response;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export function UniversalCheckout({ service, invoice, onSuccess, onError }: UniversalCheckoutProps) {
  // Validate props
  if ((!service && !invoice) || (service && invoice)) {
    throw new Error('Must provide either service or invoice, but not both');
  }

  const isInvoice = !!invoice;
  const displayData = isInvoice 
    ? {
        name: `Invoice #${invoice.number}`,
        price: invoice.total_amount,
        currency: invoice.currency,
        canPayWithStripe: !!invoice.provider_id?.trim(),
      }
    : {
        name: service.name,
        price: service.price,
        currency: service.currency,
        canPayWithStripe: true, // Services can always be paid with Stripe
      };

  const handleSubmit = async (formData: any) => {
    try {
      // Validate Stripe payment for invoices
      if (isInvoice && formData.selectedPaymentMethod === 'stripe' && !displayData.canPayWithStripe) {
        onError('This invoice cannot be paid with Stripe. Please use manual payment.');
        return;
      }

      const result = await handleSubmitPayment({
        ...(isInvoice ? { invoice } : { service }),
        values: formData,
        stripeId: formData.stripeAccountId,
        paymentMethodId: formData.paymentMethodId,
        coupon: formData.couponCode,
        quantity: formData.quantity ?? 1,
        selectedPaymentMethod: formData.selectedPaymentMethod,
        baseUrl: window.location.origin,
      });

      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error ?? 'Payment failed');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unexpected error');
    }
  };

  return (
    <div>
      <h2>Pay for {displayData.name}</h2>
      <p>Amount: {displayData.price} {displayData.currency}</p>
      
      {isInvoice && !displayData.canPayWithStripe && (
        <div className="warning">
          ⚠️ This invoice can only be paid manually as it has no Stripe provider_id
        </div>
      )}
      
      {/* Here would go your checkout form */}
      {/* ... */}
    </div>
  );
}

export default {
  payService,
  payInvoiceWithStripe,
  payInvoiceManually,
  UniversalCheckout,
};
