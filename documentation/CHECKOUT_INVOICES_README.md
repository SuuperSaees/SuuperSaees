# Invoice-Compatible Checkout

## Changes Summary

The checkout system is now compatible with both **services** and **invoices**. This allows users to pay existing invoices in addition to services.

## Implemented Features

### 1. Invoice Compatibility
- ✅ Checkout can handle both `service` and `invoice`
- ✅ Validation to ensure only one or the other is provided
- ✅ Stripe payment support (only if invoice has `provider_id`)
- ✅ Manual payment support
- ✅ Session metadata only includes `manual_payment_info` and `discount_coupon`

### 2. New API Route
- ✅ Created `/api/stripe/invoice-payment` to process invoice payments with Stripe
- ✅ Validation that invoice exists and has valid `provider_id`
- ✅ Discount/coupon application
- ✅ Automatic invoice status update upon payment completion
- ✅ Payment registration in `invoice_payments`

### 3. Updated Functions
- ✅ `handleSubmitPayment` now accepts `service` or `invoice`
- ✅ New `handleInvoicePayment` function in `billing-handlers.ts`
- ✅ Improved error handling

## Usage

### For Services (Existing Functionality)
```typescript
const result = await handleSubmitPayment({
  service: myService,
  values: formValues,
  stripeId: 'stripe_account_id',
  paymentMethodId: 'pm_1234',
  coupon: 'DISCOUNT_CODE',
  selectedPaymentMethod: 'stripe', // or 'manual_payment'
  baseUrl: 'https://myapp.com',
});
```

### For Invoices (New Functionality)
```typescript
const result = await handleSubmitPayment({
  invoice: myInvoice,
  values: formValues,
  stripeId: 'stripe_account_id',
  paymentMethodId: 'pm_1234',
  coupon: 'DISCOUNT_CODE',
  selectedPaymentMethod: 'stripe', // or 'manual_payment'
  baseUrl: 'https://myapp.com',
});
```

### Getting an Invoice
```typescript
import { getInvoice } from '~/server/actions/invoices/invoices.action';

const invoice = await getInvoice('invoice_uuid');
```

## Important Validations

### For Stripe Payments
- Invoice **MUST** have a valid `provider_id` (not empty, not null)
- If it doesn't have `provider_id`, Stripe payment will fail

### For Manual Payments
- Works regardless of `provider_id`
- Requires `manual_payment_info` in form values
- Automatically creates a record in `invoice_payments`

### Session Metadata
Only included in metadata:
- `manual_payment_info`: If provided and method is manual
- `discount_coupon`: If a coupon is provided

## Response Structure

```typescript
{
  success: boolean;
  error: string | null;
  accountAlreadyExists: boolean;
  data: {
    paymentUrl?: string;
  };
}
```

## Compatibility

- ✅ **Does not break** existing services functionality
- ✅ Maintains all existing Treli logic
- ✅ Maintains all recurring and one-time payment logic
- ✅ Maintains coupon and discount handling
- ✅ Maintains existing response structure

## Next Steps

To implement in UI:
1. Modify checkout component to accept `invoice` as optional prop
2. Add conditional logic to display invoice vs service data
3. Ensure form includes `manual_payment_info` when necessary
4. Validate that if an invoice is passed for Stripe payment, it has `provider_id`

## Integration Example

```typescript
// In your checkout component
interface CheckoutProps {
  service?: Service.Relationships.Billing.BillingService;
  invoice?: Invoice.Response;
}

const CheckoutComponent = ({ service, invoice }: CheckoutProps) => {
  // Validate that only one is provided
  if ((!service && !invoice) || (service && invoice)) {
    throw new Error('Must provide either service or invoice, but not both');
  }

  // For invoices with Stripe, validate provider_id
  if (invoice && selectedPaymentMethod === 'stripe') {
    if (!invoice.provider_id || invoice.provider_id.trim() === '') {
      // Show error or disable Stripe option
    }
  }

  // Rest of checkout logic...
};
```
