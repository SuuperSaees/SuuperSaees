import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Service } from '~/lib/services.types';
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
  expires_at: Date;
  organization_id: string;
  payment_methods: BillingAccounts.PaymentMethod[];
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
}

export interface DefaultToken {
    account_id: string;
    agency_id: string;
    data: unknown;
    id?: string;
}

export interface TokenIdPayload {
  id: string;
}

export interface ITokensAction {
    createToken: (payload: Token | PayToken | TokenRecoveryType) => Promise<{ accessToken: string; tokenId: string }>;
    // decodeToken<T>(token: string, base: 'base64' | 'utf-8'): T | null;
    // saveToken: (token: Tokens.Insert) => Promise<void>;
    // revokeToken: (tokenId: string) => Promise<void>;
    generateTokenId: (payload: TokenIdPayload) => Promise<string>;
}
