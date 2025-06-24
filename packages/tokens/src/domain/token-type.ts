import { BillingAccounts } from '../../../../apps/web/lib/billing-accounts.types';
import { Service } from '../../../../apps/web/lib/services.types';
import { Invoice } from '../../../../apps/web/lib/invoice.types';


export interface Token {
  id?: string;
customer_email: string;
customer_name: string;
customer_id: string;
subscription_id: string;
expires_at: Date;
}

export interface PayToken {
  id?: string;
account_id: string;
price_id: string;
service: Service.Type;
invoice?: Invoice.Type;
expires_at: Date;
organization_id: string;
payment_methods: BillingAccounts.PaymentMethod[];
primary_owner_id: string;
}

export interface SuuperApiKeyToken {
  id?: string;
  domain: string;
  user_id: string;
  organization_id: string;
  role: string;
  agency_id: string;
}
export interface TokenRecoveryType {
  id?: string;
  email: string;
  redirectTo: string;
  user_id?: string;
  domain?: string;
}

export interface DefaultToken {
  account_id: string;
  agency_id: string;
  data: unknown;
  id?: string;
}