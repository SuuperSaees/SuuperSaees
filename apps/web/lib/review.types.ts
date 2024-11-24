import { Database } from './database.types';
import { Order } from './order.types';
import { UserSettings } from './user-settings.types';
import { User } from './user.types';

export namespace Review {
  export type Type = Database['public']['Tables']['reviews']['Row'];
  export type Insert = Database['public']['Tables']['reviews']['Insert'];
  export type Update = Database['public']['Tables']['reviews']['Update'];

  export type Response = Review.Type & {
    order: Pick<Order.Type, 'title' | 'id'> | null;
    user: User.Response & {
      settings: Pick<UserSettings.Type, 'picture_url' | 'name'> | null
    } | null;
  };
}
