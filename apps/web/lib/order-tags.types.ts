import { Database } from './database.types';

export namespace OrderTags {
    export type Type = Database['public']['Tables']['order_tags']['Row'];
    export type Insert = Database['public']['Tables']['order_tags']['Insert'];
    export type Update = Database['public']['Tables']['order_tags']['Update'];
}