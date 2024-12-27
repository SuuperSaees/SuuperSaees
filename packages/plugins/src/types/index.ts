import { Json } from '@kit/supabase/database';

export interface Plugin {
  id: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
  deleted_on?: string | null;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  type: 'integration' | 'tool' | 'internal' | 'external';
  provider: string;
  credentials: Json;
  account_id: string;
}

export interface PluginInsert {
  provider_id: string;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  type: 'integration' | 'tool' | 'internal' | 'external';
  provider: string;
  credentials: Json;
  account_id: string;
  deleted_on?: string | null;
}

export interface Plugin {
    id: string;
    provider_id: string;
    created_at: string;
    updated_at: string;
    deleted_on?: string | null;
    status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
    type: 'integration' | 'tool' | 'internal' | 'external';
    provider: string;
    credentials: Json;
    account_id: string;
  }

  export interface ServiceError {
    message: string;
    error?: Error;
  }
