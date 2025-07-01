import { InvoiceSettings } from '~/server/actions/invoices/type-guards';
import { Database } from './database.types';
import { Organization } from './organization.types';
import { User } from './user.types';

export namespace Client {
  export type Type = Database['public']['Tables']['clients']['Row'];
  export type Insert = Database['public']['Tables']['clients']['Insert'];
  export type Update = Database['public']['Tables']['clients']['Update'];

  export type Response = Pick<
    Type,
    'id' | 'agency_id' | 'organization_client_id' | 'user_client_id' | 'deleted_on'
  > & {
    user?: User.Response | null;
    organization?: Organization.Response & {
      settings?: {
        billing?: InvoiceSettings | null;
      } | null;
    } | null;
  };
}
