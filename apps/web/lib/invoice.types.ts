import { Database } from './database.types';
import { User } from './user.types';
import { Organization } from './organization.types';

export namespace Invoice {
  export type Type = Database['public']['Tables']['invoices']['Row'];
  export type Insert = Database['public']['Tables']['invoices']['Insert'];
  export type Update = Database['public']['Tables']['invoices']['Update'];

  export type Response = Omit<Invoice.Type, 'customer_id' | 'organization_id'> & {
    customer: User.Response | null;
    organization: Organization.Response | null;
    invoice_items?: InvoiceItem.Response[] | null;
    total_amount?: number;
    items_count?: number;
  };

  export type Relational = Invoice.Type & {
    customer: User.Response;
    organization: Organization.Response;
    invoice_items: InvoiceItem.Response[];
  };

  export type InsertWithRelations = Invoice.Insert & {
    invoice_items?: InvoiceItem.Insert[];
  };

  export namespace Relationships {
    export type Customer = Invoice.Type & {
      customer: User.Response;
    };
    export type Organization = Invoice.Type & {
      organization: Organization.Response;
    };
    export type Items = Invoice.Type & {
      invoice_items: InvoiceItem.Response[];
    };
    export type All = Invoice.Type & {
      customer: User.Response;
      organization: Organization.Response;
      invoice_items: InvoiceItem.Response[];
    };
  }

  export namespace Enums {
    export enum Status {
      DRAFT = 'draft',
      SENT = 'sent',
      PAID = 'paid',
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