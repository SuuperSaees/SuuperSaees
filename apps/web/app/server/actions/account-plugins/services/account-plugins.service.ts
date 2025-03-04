import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

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

import { AccountPluginsRepository } from '../repositories/account-plugins.repository';
import { AccountPlugin, AccountPluginInsert } from '~/lib/plugins.types';
export class AccountPluginsService {
    private repository: AccountPluginsRepository;

    constructor(repository: AccountPluginsRepository) {
        this.repository = repository;
    }

    async list(accountId: string, limit?: number, offset?: number): Promise<AccountPlugin[]> {
        return this.repository.get({ accountId, limit, offset });
    }

    async create(payload: AccountPluginInsert): Promise<AccountPlugin> {
        return this.repository.create(payload);
    }

    async update(id: string, payload: Partial<AccountPluginInsert>): Promise<AccountPlugin> {
        return this.repository.update(id, payload);
    }

    async delete(id: string, accountId: string, provider: string): Promise<void> {
        return this.repository.delete(id, accountId, provider);
    }

    async get(id: string): Promise<AccountPlugin | null> {
        return this.repository.get({ id });
    }

    async getByAccount(accountId: string, limit?: number, offset?: number): Promise<AccountPlugin[]> {
        return this.repository.getByAccount(accountId, limit, offset);
    }
    
    
}
