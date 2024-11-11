import { Database } from "./database.types";

export namespace FormField {
    export type Type = Database['public']['Tables']['form_fields']['Row']
    export type Update = Database['public']['Tables']['form_fields']['Update']
    export type Insert = Database['public']['Tables']['form_fields']['Insert']

    export type Response = Pick<
        FormField.Type,
        | 'id'
        | 'label'
        | 'description'
        | 'placeholder'
        | 'position'
        | 'required'
        | 'alert_message'
        | 'options'
    >;
}