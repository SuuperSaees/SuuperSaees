import { BillingAccounts } from '../billing-accounts.types';

export type TreliAccountData = {
  provider: BillingAccounts.BillingProvider;
  username: string;
  password: string;
  namespace: string;
  accountId: string;
};

// export type StripeAccountData = {
//   provider: BillingAccounts.BillingProvider;
//   namespace: string;
// };

// export type AnyAccountData = {
//   provider: BillingAccounts.BillingProvider;
//   namespace: string;
// };

export type BillingAccount = TreliAccountData; // | StripeAccountData | AnyAccountData;
