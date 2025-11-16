import { Json } from '@kit/supabase/database';

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  type: 'integration' | 'tool' | 'internal' | 'external';
  created_at: string;
  updated_at: string;
  deleted_on?: string | null;
  metadata?: Json;
  icon_url?: string | null;
}

export interface PluginInsert {
  name: string;
  description?: string;
  type: 'integration' | 'tool' | 'internal' | 'external';
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
  deleted_on?: string | null;
  icon_url?: string | null;
}

export interface AccountPlugin {
  id: string;
  plugin_id: string;
  account_id: string;
  provider_id?: string;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  credentials?: Json;
  created_at: string;
  updated_at: string;
  deleted_on?: string | null;
  plugins?: {
    id: string;
    name: string;
  };
}

export interface AccountPluginInsert {
  plugin_id: string;
  account_id: string;
  provider_id?: string | null;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  credentials?: Json;
  deleted_on?: string | null;
}

export interface BillingAccountBase {
  account_id: string;
  provider: 'stripe' | 'lemon-squeezy' | 'paddle' | 'treli' | 'suuper';
  provider_id?: string | null;
  credentials?: Json;
  namespace?: string;
  deleted_on?: string | null;
}

export interface BillingAccount extends BillingAccountBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface BillingAccountInsert extends BillingAccountBase {
  created_at?: string;
  updated_at?: string;
}

export interface ServiceError {
  message: string;
  error?: Error;
}
