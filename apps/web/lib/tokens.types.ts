import { Database } from './database.types';


export namespace Tokens {
  export type Type = Database['public']['Tables']['tokens']['Row'];
  export type Insert = Database['public']['Tables']['tokens']['Insert'];
  export type Update = Database['public']['Tables']['tokens']['Update'];
  export const EXTRA_TOKENS_KEYS = {
    session_id: 'session_id',
    sha256: 'sha256',
    base64: 'base64',
  };
}