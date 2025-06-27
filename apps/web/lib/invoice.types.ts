import { Database } from './database.types';
import { Organization } from './organization.types';

export namespace InvoiceSettings {
  export type Type = Database['public']['Tables']['invoice_settings']['Row'];
  export type Insert = Database['public']['Tables']['invoice_settings']['Insert'];
  export type Update = Database['public']['Tables']['invoice_settings']['Update'];

  export type Response = InvoiceSettings.Type;
}

export namespace Invoice {
  export type Type = Database['public']['Tables']['invoices']['Row'];
  export type Insert = Database['public']['Tables']['invoices']['Insert'];
  export type Update = Database['public']['Tables']['invoices']['Update'];

  export namespace Request {
    export type Create = Omit<Invoice.Insert, 'number'> & {
      number?: string; // Optional since it's auto-generated
      invoice_items?: InvoiceItem.Insert[] | null;
      invoice_settings?: InvoiceSettings.Insert[] | null;
    };
    export type Update = Invoice.Update & {
      invoice_items?: InvoiceItem.Insert[] | null;
      invoice_settings?: InvoiceSettings.Insert[] | null;
    };
  }

  export type Response = Invoice.Type & {
    client: Organization.Response | null;
    agency: Organization.Response | null;
    invoice_items?: InvoiceItem.Response[] | null;
    invoice_settings?: InvoiceSettings.Response[] | null;
    total_amount?: number;
    items_count?: number;
  };
  
  export namespace Enums {
    export enum Status {
      DRAFT = 'draft',
      ISSUED = 'issued',
      PAID = 'paid',
      PARTIALLY_PAID = 'partially_paid',
      VOIDED = 'voided',
      OVERDUE = 'overdue',
      CANCELLED = 'cancelled',
    }

    export enum PaymentMethod {
      BANK_TRANSFER = 'bank_transfer',
      CREDIT_CARD = 'credit_card',
      PAYPAL = 'paypal',
      CASH = 'cash',
    }
  }
}

export namespace InvoiceItem {
  export type Type = Database['public']['Tables']['invoice_items']['Row'];
  export type Insert = Database['public']['Tables']['invoice_items']['Insert'];
  export type Update = Database['public']['Tables']['invoice_items']['Update'];

  export type Response = InvoiceItem.Type & {
    total_price?: number;
  };
}