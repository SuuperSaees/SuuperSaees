import { Database } from './database.types';
import { Order } from './order.types';
import { User } from './user.types';

export namespace Review {
  export type Type = Database['public']['Tables']['reviews']['Row'];
  export type Insert = Database['public']['Tables']['reviews']['Insert'];
  export type Update = Database['public']['Tables']['reviews']['Update'];

  export type Response = {
    data: (Review.Type & {
      order?: Pick<Order.Type, 'title' | 'id'> | null;
      user?: User.Response | null;
    })[];
    nextCursor: string | null;
  };
}
