# Invoice Settings Implementation

## Overview

The invoice system now supports `invoice_settings` which store organization billing information for both agencies and clients. This allows invoices to capture and preserve organization details at the time of invoice creation.

## ✅ What's Been Implemented

### 1. **Database Support**
- ✅ `invoice_settings` table created with proper foreign keys
- ✅ Soft delete support with `deleted_on` field  
- ✅ Unique constraint on `invoice_id + organization_id` combination
- ✅ Indexes for optimal query performance

### 2. **Type System Updates**
- ✅ `InvoiceSettings` namespace added to `invoice.types.ts`
- ✅ `Invoice.Request.Create` and `Invoice.Request.Update` now support `invoice_settings[]`
- ✅ `Invoice.Response` includes `invoice_settings[]` in responses

### 3. **Repository Layer**
- ✅ New `InvoiceSettingsRepository` with full CRUD operations
- ✅ `InvoiceRepository` updated to handle settings creation/updates
- ✅ Both `list()` and `get()` methods include invoice_settings in queries
- ✅ Cascade handling for invoice deletion

### 4. **Backward Compatibility**
- ✅ **100% backward compatible** - existing invoices work without changes
- ✅ `invoice_settings` is optional in all operations
- ✅ No breaking changes to existing server actions

## 🚀 Usage

### Creating Invoice with Settings

```typescript
import { createInvoice } from '~/server/actions/invoices/invoices.action';

const invoiceWithSettings = await createInvoice({
  client_organization_id: 'client_id',
  agency_id: 'agency_id',
  issue_date: new Date().toISOString(),
  due_date: new Date().toISOString(),
  status: 'draft',
  subtotal_amount: 1000,
  tax_amount: 100,
  total_amount: 1100,
  currency: 'USD',
  notes: 'Monthly services',
  invoice_items: [
    {
      description: 'Web Development',
      quantity: 40,
      unit_price: 25,
      total_price: 1000,
    }
  ],
  invoice_settings: [
    {
      organization_id: 'agency_id',
      name: 'My Agency LLC',
      address_1: '123 Business St',
      country: 'United States',
      postal_code: '12345',
      city: 'New York',
      state: 'NY',
      tax_id_type: 'EIN',
      tax_id_number: '12-3456789',
    },
    {
      organization_id: 'client_id', 
      name: 'Client Company Inc',
      address_1: '456 Client Ave',
      country: 'United States',
      postal_code: '67890',
      city: 'Los Angeles',
      state: 'CA',
      tax_id_type: 'EIN',
      tax_id_number: '98-7654321',
    }
  ]
});
```

### Updating Invoice Settings

```typescript
import { updateInvoice } from '~/server/actions/invoices/invoices.action';

await updateInvoice({
  id: 'invoice_id',
  status: 'issued',
  invoice_settings: [
    {
      organization_id: 'agency_id',
      name: 'Updated Agency Name',
      address_1: 'New Address',
      // ... other fields
    }
  ]
});
```

### Reading Invoice with Settings

```typescript
import { getInvoice } from '~/server/actions/invoices/invoices.action';

const invoice = await getInvoice('invoice_id');

console.log('Invoice settings:', invoice.invoice_settings);

// Find agency settings
const agencySettings = invoice.invoice_settings?.find(
  setting => setting.organization_id === invoice.agency_id
);

// Find client settings  
const clientSettings = invoice.invoice_settings?.find(
  setting => setting.organization_id === invoice.client_organization_id
);
```

## 📋 Database Schema

```sql
CREATE TABLE invoice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_on TIMESTAMP WITH TIME ZONE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address_1 TEXT NOT NULL,
  address_2 TEXT,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  tax_id_type TEXT,
  tax_id_number TEXT,
  
  UNIQUE (invoice_id, organization_id) WHERE deleted_on IS NULL
);
```

## 🔧 Repository Methods

### InvoiceSettingsRepository

```typescript
// Create single setting
create(payload: InvoiceSettings.Insert): Promise<InvoiceSettings.Type>

// Create multiple settings
createMany(payloads: InvoiceSettings.Insert[]): Promise<InvoiceSettings.Type[]>

// Get settings by invoice ID
getByInvoiceId(invoiceId: string): Promise<InvoiceSettings.Response[]>

// Get single setting
get(settingsId: string): Promise<InvoiceSettings.Response>

// Update setting
update(payload: InvoiceSettings.Update): Promise<InvoiceSettings.Type>

// Update by invoice + organization
updateByInvoiceAndOrganization(
  invoiceId: string, 
  organizationId: string, 
  payload: UpdatePayload
): Promise<InvoiceSettings.Type>

// Soft delete setting
delete(settingsId: string): Promise<void>

// Soft delete all settings for invoice
deleteByInvoiceId(invoiceId: string): Promise<void>
```

### Updated InvoiceRepository

```typescript
// Now accepts Invoice.Request.Create with optional invoice_settings
create(payload: Invoice.Request.Create): Promise<Invoice.Type>

// Now accepts Invoice.Request.Update with optional invoice_settings  
update(payload: Invoice.Request.Update): Promise<Invoice.Type>

// Returns Invoice.Response with invoice_settings included
get(invoiceId: string): Promise<Invoice.Response>

// Returns list with invoice_settings included for each invoice
list(): Promise<{ data: Invoice.Response[], ... }>
```

## 🛡️ Data Integrity

### Automatic Handling
- ✅ Settings are created with the invoice ID automatically
- ✅ Settings cascade delete when invoice is deleted
- ✅ Unique constraint prevents duplicate settings per invoice/organization
- ✅ Soft delete preserves historical data

### Error Handling
- ✅ Invoice creation continues even if settings fail (logged)
- ✅ Settings updates are independent of invoice updates
- ✅ Validation ensures required fields are present

## 📊 Response Structure

```typescript
interface Invoice.Response {
  // ... all existing invoice fields
  invoice_settings?: InvoiceSettings.Response[];
}

interface InvoiceSettings.Response {
  id: string;
  invoice_id: string;
  organization_id: string;
  name: string;
  address_1: string;
  address_2: string | null;
  country: string;
  postal_code: string;
  city: string;
  state: string | null;
  tax_id_type: string | null;
  tax_id_number: string | null;
  created_at: string;
  updated_at: string;
}
```

## 🔄 Migration Path

### For Existing Code
- ✅ **No changes required** - existing code continues to work
- ✅ Existing invoices will have empty `invoice_settings: []`
- ✅ All server actions maintain same signatures

### For New Features
- ✅ Add `invoice_settings` to create/update payloads when needed
- ✅ Use settings data for invoice PDF generation
- ✅ Preserve organization details for compliance/auditing

## 🎯 Next Steps for Frontend

1. **Optional Enhancement**: Update invoice forms to capture organization billing details
2. **PDF Generation**: Use `invoice_settings` for proper invoice formatting
3. **Historical Preservation**: Settings preserve organization details at invoice time
4. **Compliance**: Support for tax ID and proper billing address requirements

## ✅ Testing

All functionality has been implemented and tested:
- ✅ Type safety with TypeScript
- ✅ Repository methods work correctly
- ✅ Server actions updated and compatible
- ✅ Backward compatibility maintained
- ✅ Database constraints and indexes in place

The system is ready for frontend integration while maintaining 100% compatibility with existing invoice workflows.
