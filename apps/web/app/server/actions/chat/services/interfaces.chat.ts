import { Json } from '@kit/supabase/database';

export interface ChatPayload {
  name: string;
  account_id: string;
  settings?: Json;
  visibility: boolean;
  reference_id: string;
}

export interface ChatResponse {
  id: string;
  name: string;
  account_id: string;
  settings?: Json;
  visibility: boolean;
  reference_id: string;
  created_at: string;
  updated_at?: string;
  deleted_on?: string | null;
}
