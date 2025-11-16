import { randomUUID } from 'crypto';

import { BillingAccounts } from '~/lib/billing-accounts.types';
import { CredentialsCrypto } from '~/utils/credentials-crypto';

import { CreateAccountDTO, UpdateAccountDTO } from '../dtos/account.dto';

export class BillingAccountBuilder {
  private accountInsert: BillingAccounts.Insert = {
    account_id: '',
    provider_id: '',
    namespace: 'production',
    credentials: JSON.stringify({}),
    provider: undefined,
  };

  private credentialsCrypto: CredentialsCrypto;

  constructor() {
    const secretKey = Buffer.from(
      process.env.CREDENTIALS_SECRET_KEY ?? '',
      'hex',
    );
    this.credentialsCrypto = new CredentialsCrypto(secretKey);
  }

  setAccountId(accountId: string) {
    this.accountInsert.account_id = accountId;
    return this;
  }

  setProvider(provider: BillingAccounts.BillingProvider) {
    this.accountInsert.provider = provider;
    return this;
  }

  setProviderId(providerId: string) {
    this.accountInsert.provider_id = providerId;
    return this;
  }

  setNamespace(namespace: string) {
    this.accountInsert.namespace = namespace;
    return this;
  }

  setCredentials(username: string, password: string) {
    const credentials = {
      username,
      password,
      created_at: new Date().toISOString(),
    };

    const encryptedCreds = this.credentialsCrypto.encrypt(credentials);
    this.accountInsert.credentials = JSON.stringify(encryptedCreds);
    return this;
  }

  buildAccountInsert(): BillingAccounts.Insert {
    if (!this.accountInsert.provider || !this.accountInsert.provider_id) {
      throw new Error('Missing required fields: provider and provider_id');
    }

    return {
      ...this.accountInsert,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static fromDTO(
    dto: CreateAccountDTO | UpdateAccountDTO,
  ): BillingAccounts.Insert {
    const builder = new BillingAccountBuilder();
    const newProviderId = `suuper${randomUUID()}`;
    return builder
      .setProvider(dto.provider)
      .setAccountId(dto.accountId ?? '')
      .setProviderId(newProviderId)
      .setNamespace(dto.namespace)
      .setCredentials(dto.username, dto.password)
      .buildAccountInsert();
  }
}
