import { BillingAccounts } from '../../../../apps/web/lib/billing-accounts.types';
import { Service } from '../../../../apps/web/lib/services.types';

export interface Token {
  customer_email: string;
  customer_name: string;
  customer_id: string;
  subscription_id: string;
  expires_at: Date;
}

export interface PayToken {
  account_id: string;
  price_id: string;
  service: Service.Type;
  expires_at: Date;
  organization_id: string;
  // payment_method: BillingAccounts.PaymentMethod;
}
export interface TokenRecoveryType {
  email: string;
  redirectTo: string;
}