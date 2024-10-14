import { Database } from './database.types';

export namespace OrganizationSettings {
  export type Type =
    Database['public']['Tables']['organization_settings']['Row'];
}
