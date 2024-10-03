import { Database } from './database.types';


export namespace Brief {
  export type Type = Database['public']['Tables']['briefs']['Row'] & {
    services?: Database['public']['Tables']['services']['Row'][];
  };
  export type Insert = Database['public']['Tables']['briefs']['Insert'];
  export type Update = Database['public']['Tables']['briefs']['Update'];

  //   const briefs: {
  //     created_at: string;
  //     id: string;
  //     name: string;
  //     propietary_organization_id: string | null;
  //     form_fields: {
  //         field: {
  //             description: string | null;
  //             label: string;
  //         } | null;
  //     }[];
  // }[] | null
  export type BriefResponse = Database['public']['Tables']['briefs']['Row'] & {
    form_fields?: {
      field: {
        id: string;
        label: string;
        description: string | null;
        type: string;
        options?: [] | null;
        placeholder: string | null;
      } | null;
    }[];
  };
  export namespace Relationships {
    export type Service =
      Database['public']['Tables']['service_briefs']['Insert'];
    export type FormFieldResponses =
      Database['public']['Tables']['brief_responses']['Insert'];
  }
}