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
}

export interface PluginInsert {
  name: string;
  description?: string;
  type: 'integration' | 'tool' | 'internal' | 'external';
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
  deleted_on?: string | null;
}

export interface AccountPlugin {
  id: string;
  plugin_id: string;
  account_id: string;
  provider_id: string;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  credentials?: Json;
  created_at: string;
  updated_at: string;
  deleted_on?: string | null;
}

export interface AccountPluginInsert {
  plugin_id: string;
  account_id: string;
  provider_id: string;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  credentials?: Json;
  deleted_on?: string | null;
}

export interface ServiceError {
  message: string;
  error?: Error;
}
