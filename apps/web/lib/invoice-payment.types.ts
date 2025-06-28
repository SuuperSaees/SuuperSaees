export namespace InvoicePayment {
  export interface Type {
    id: string;
    invoice_id: string;
    payment_method: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_date: string;
    reference_number?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  }

  export interface Insert {
    invoice_id: string;
    payment_method: string;
    amount: number;
    currency: string;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_date?: string;
    reference_number?: string;
    notes?: string;
  }

  export interface Update {
    id: string;
    payment_method?: string;
    amount?: number;
    currency?: string;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_date?: string;
    reference_number?: string;
    notes?: string;
  }

  export namespace Request {
    export interface Create extends Insert {}
    export interface Update extends Update {}
  }

  export interface Response extends Type {
    invoice?: {
      id: string;
      number: string;
      total_amount: number;
      currency: string;
    };
  }
}