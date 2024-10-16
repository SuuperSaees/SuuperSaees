import { Database } from './database.types';
import { Service as ServiceType } from './services.types';

export namespace Brief {
  export type Type = Database['public']['Tables']['briefs']['Row'];
  export type Insert = Database['public']['Tables']['briefs']['Insert'];
  export type Update = Database['public']['Tables']['briefs']['Update'];

  export type Response = Pick<
    Brief.Type,
    | 'id'
    | 'created_at'
    | 'name'
    | 'description'
    | 'image_url'
    | 'propietary_organization_id'
  >;

  export namespace Relationships {
    export namespace Services {
      export type Response = Brief.Response & {
        services: {
          name: ServiceType.Type['name'];
        }[];
      };
    }
    export type Service = Brief.Type & {
      services?: Database['public']['Tables']['services']['Row'][];
    };
    export type FormFieldResponses =
      Database['public']['Tables']['brief_responses']['Insert'];

    export type FormField =
      Database['public']['Tables']['form_fields']['Row'] & {
        form_fields?: {
          // id, description, label, type, options, placeholder, position, alert_message
          field: Pick<
            Database['public']['Tables']['form_fields']['Row'],
            | 'id'
            | 'description'
            | 'label'
            | 'type'
            | 'options'
            | 'placeholder'
            | 'position'
            | 'alert_message'
          >;
        }[];
      };
  }
}
