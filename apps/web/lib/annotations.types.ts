import { Database } from './database.types';

export namespace Annotation {
  export type Type = Database['public']['Tables']['annotations']['Row'];
  export type Insert = Database['public']['Tables']['annotations']['Insert'];
  export type Update = Database['public']['Tables']['annotations']['Update'];
  export type AnnotationStatus =
    Database['public']['Enums']['annotations_status'];

  export const AnnotationStatusKeys = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    DRAFT: 'draft',
  } as const satisfies Record<string, AnnotationStatus>;
}
