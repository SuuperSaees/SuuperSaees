import { Database } from "./database.types";

export namespace InvoicePayment {
  export type Type = Database["public"]["Tables"]["invoice_payments"]["Row"];
  export type Insert = Database["public"]["Tables"]["invoice_payments"]["Insert"];
  export type Update = Database["public"]["Tables"]["invoice_payments"]["Update"];

  export namespace Request {
    export type Create = Insert & {
      session_id?: string; // Optional for manual payments
    };
    export type Update = InvoicePayment.Update
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