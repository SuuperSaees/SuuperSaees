import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { BillingAccountInsert } from '~/lib/plugins.types';
import { Json } from '@kit/supabase/database';
import { AccountPluginsRepository } from '../repositories/account-plugins.repository';
import { AccountPlugin, AccountPluginInsert } from '~/lib/plugins.types';
import { CredentialsCrypto, EncryptedCredentials } from '~/utils/credentials-crypto';
import { PluginsRepository } from '../../plugins/repositories/plugins.repository'
/**
 * Utility to generate a UUID.
 * @returns A new UUID string.
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Zod schema to validate PluginInsert objects.
 */
export const PluginInsertSchema = z.object({
  provider_id: z.string().uuid().optional(),
  status: z.enum(['installed', 'uninstalled', 'failed', 'in progress']),
  credentials: z.record(z.string(), z.unknown()).optional(), 
  account_id: z.string().uuid(),
  deleted_on: z.string().datetime().nullable().optional(),
});

/**
 * Zod schema to validate partial updates to a PluginInsert object.
 */
export const PluginUpdateSchema = PluginInsertSchema.partial();

/**
 * Utility to validate a PluginInsert object.
 * Automatically generates `provider_id` if not provided.
 * @param data The object to validate.
 * @returns The validated and updated object.
 * @throws Error if the validation fails.
 */
export const validatePluginInsert = (
  data: unknown,
): z.infer<typeof PluginInsertSchema> => {
  const parsedData = PluginInsertSchema.parse(data);

  return parsedData;
};

/**
 * Utility to validate a partial PluginInsert object for updates.
 * @param data The object to validate.
 * @throws Error if the validation fails.
 */
export const validatePluginUpdate = (data: unknown): void => {
  PluginUpdateSchema.parse(data);
};

const SECRET_KEY = Buffer.from(process.env.CREDENTIALS_SECRET_KEY ?? '', 'hex');

export class AccountPluginsService {
    private repository: AccountPluginsRepository;
    private pluginsRepository?: PluginsRepository;

    constructor(repository: AccountPluginsRepository, pluginsRepository?: PluginsRepository) {
        this.repository = repository;
        this.pluginsRepository = pluginsRepository;
    }

    async list(accountId: string, limit?: number, offset?: number): Promise<AccountPlugin[]> {
        return this.repository.list(accountId, limit, offset);
    }

    async create(payload: AccountPluginInsert): Promise<AccountPlugin> {
      validatePluginInsert(payload);

      if (
        payload.credentials &&
        typeof payload.credentials === 'object' &&
        !Array.isArray(payload.credentials) &&
        Object.keys(payload.credentials).length > 0
      ) {
        const pluginData = await this.pluginsRepository?.get(payload.plugin_id)
  
        if (!pluginData) {
          throw new Error(
            `[SERVICE] Failed to retrieve plugin data for provider assignment. Plugin ID: ${payload.plugin_id}`,
          );
        }
  
        const provider = pluginData.name.toLowerCase();
  
        if (provider !== 'stripe') {
          const crypto = new CredentialsCrypto(SECRET_KEY);
          const encryptedCredentials: EncryptedCredentials = crypto.encrypt(
            payload.credentials,
          );
          payload.credentials = JSON.stringify(encryptedCredentials);
        }
      } else if (payload.credentials && typeof payload.credentials === 'object') {
        payload.credentials = null;
      }

      const pluginData = await this.pluginsRepository?.get(payload.plugin_id)

    if (!pluginData) {
      throw new Error(
        `[SERVICE] Failed to retrieve plugin data for provider assignment. Plugin ID: ${payload.plugin_id}`,
      );
    }

    const provider = pluginData.name.toLowerCase() as
      | 'stripe'
      | 'treli'
      | 'paddle'
      | 'suuper'
      | 'lemon-squeezy';

    const billingData: BillingAccountInsert = {
      account_id: payload.account_id,
      provider,
      credentials: null,
      namespace: 'default-namespace',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

        return this.repository.create(payload, billingData);
    }

    async update(id: string, payload: Partial<AccountPluginInsert> & {
        provider?: string;
        account_id?: string;
    }): Promise<AccountPlugin> {
        let providerId = payload.provider_id;

        if (!providerId && payload.provider && payload.account_id) {
            providerId = await this.repository.getProviderId(id, payload.provider, payload.account_id) ?? crypto.randomUUID();
        }

        if (
          payload.provider !== 'stripe' &&
          payload.credentials &&
          typeof payload.credentials === 'object' &&
          !Array.isArray(payload.credentials) &&
          Object.keys(payload.credentials).length > 0
        ) {
          const crypto = new CredentialsCrypto(SECRET_KEY);
          payload.credentials = JSON.stringify(crypto.encrypt(payload.credentials));
        }
    
        const accountPluginUpdates: Partial<AccountPluginInsert> = {
          status: payload.status ?? undefined,
          credentials: payload.credentials,
          provider_id: providerId,
        };
    
        const billingUpdates: Partial<BillingAccountInsert> = {
          credentials: payload.credentials,
          updated_at: new Date().toISOString(),
          provider: payload.provider as BillingAccountInsert['provider'],
          account_id: payload.account_id,
          provider_id: providerId,
        };

        if (payload.provider === 'loom') {
            return this.repository.updateLoom(id, accountPluginUpdates);
        } else {
          if (payload.provider === 'stripe' || payload.provider === 'treli') {
            return this.repository.update(id, accountPluginUpdates, billingUpdates);
          } else {
            return this.repository.update(id, accountPluginUpdates);
          }
        }
    }

    async delete(id: string, accountId: string, provider: string): Promise<void> {
        return this.repository.delete(id, accountId, provider);
    }

    async get(id?: string, name?: string): Promise<AccountPlugin> {
        const accountPlugin = await this.repository.get({ id, name});
        const pluginName = accountPlugin.plugins?.name.toLowerCase();

        if (
          pluginName !== 'stripe' && pluginName !== 'embeds' &&
          accountPlugin.credentials && 
          !(
            (typeof accountPlugin.credentials === 'object' && !Object.keys(accountPlugin.credentials).length) ||
            (typeof accountPlugin.credentials === 'string' && 
              (accountPlugin.credentials.trim() === '' || accountPlugin.credentials === '{}'))
          )
        ) {
          
          const crypto = new CredentialsCrypto(SECRET_KEY);
          try {
            const decryptedCredentials = crypto.decrypt<Record<string, unknown>>(
              JSON.parse(
                accountPlugin.credentials as string,
              ) as EncryptedCredentials,
            );
    
            accountPlugin.credentials = JSON.parse(
              JSON.stringify(decryptedCredentials),
            ) as Json;
          } catch (error) {
            throw new Error(
              '[SERVICE] Failed to decrypt account plugin credentials',
            );
          }
        }
        return accountPlugin;
    }  
    
}
