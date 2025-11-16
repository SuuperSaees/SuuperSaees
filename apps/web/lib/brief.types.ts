import { Database } from './database.types';
import { Service as ServiceType } from './services.types';

// id, description, label, type, options, placeholder, position, alert_message
type FormFieldType = Pick<
  Database['public']['Tables']['form_fields']['Row'],
  | 'id'
  | 'description'
  | 'label'
  | 'type'
  | 'options'
  | 'placeholder'
  | 'position'
  | 'required'
  | 'alert_message'
> | null;
export namespace Brief {
  export type Type = Database['public']['Tables']['briefs']['Row'];
  export type Insert = Database['public']['Tables']['briefs']['Insert'];
  export type Update = Database['public']['Tables']['briefs']['Update'];

  // This represent the response from the server
  export type Response = Pick<
    Brief.Type,
    | 'id'
    | 'created_at'
    | 'name'
    | 'description'
    | 'image_url'
    | 'propietary_organization_id'
    | 'deleted_on'
  >;

  // This represent the request from the client to the server
  export namespace Request {
    export type Create = Omit<
      Brief.Insert,
      'propietary_organization_id' | 'name'
    > & {
      name?: string;
    };
    export type Update = Omit<Brief.Update, 'propietary_organization_id'> & {
      id: Brief.Type['id'];
    };
  }

  export namespace Relationships {
    export namespace Services {
      export type Response = Brief.Response & {
        services: {
          id: ServiceType.Type['id'];
          name: ServiceType.Type['name'];
        }[];
        form_fields?: {
          field: FormFieldType;
        }[];
      };
    }

    export namespace FormFieldResponse {
      export type Response = {
        field: FormFieldType;
        response: Database['public']['Tables']['brief_responses']['Row']['response'];
        brief: {
          name: Database['public']['Tables']['briefs']['Row']['name'];
        };
      };
    }

    export type Service = Brief.Type & {
      services?: Database['public']['Tables']['services']['Row'][];
    };
    export type FormFieldResponses =
      Database['public']['Tables']['brief_responses']['Insert'];

    export type FormField = {
      form_fields: FormFieldType;
    };

    export namespace FormFields {
      export type Response = Brief.Type & {
        form_fields: FormFieldType[];
      };
    }
  }
}

export namespace FormField {
  export type Type = Database['public']['Tables']['form_fields']['Row'];
  export type Insert = Database['public']['Tables']['form_fields']['Insert'];
  export type Update = Database['public']['Tables']['form_fields']['Update'];

  export type Response = FormField.Type;
}

export namespace BriefResponse {
  export type Type = Database['public']['Tables']['brief_responses']['Row'];
  export type Insert =
    Database['public']['Tables']['brief_responses']['Insert'];
  export type Update =
    Database['public']['Tables']['brief_responses']['Update'];

  export type Response = Pick<Type, 'id' | 'response' | 'created_at'> & {
    brief?:
      | (Omit<Partial<Brief.Response>, 'id' | 'name'> &
          Pick<Brief.Response, 'id' | 'name'>)
      | null;
    field?: FormField.Response | null;
  };
}
