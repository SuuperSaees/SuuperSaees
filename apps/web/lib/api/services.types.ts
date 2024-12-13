import { BillingAccounts } from '../billing-accounts.types';
import { Service } from '../services.types';

export type Services = Service.Type & {
  organizationId: string;
  provider: BillingAccounts.BillingProvider;
  provider_id: string;
};
