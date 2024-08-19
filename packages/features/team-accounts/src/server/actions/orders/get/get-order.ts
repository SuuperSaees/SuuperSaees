'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Activity } from '../../../../../../../../apps/web/lib/activity.types';
import { File } from '../../../../../../../../apps/web/lib/file.types';
import { Message } from '../../../../../../../../apps/web/lib/message.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { Review } from '../../../../../../../../apps/web/lib/review.types';
import { User as ServerUser } from '../../../../../../../../apps/web/lib/user.types';

type User = Pick<ServerUser.Type, 'email' | 'id' | 'name' | 'picture_url'>;

type OrderWithAllRelations = Order.Relationships.All & {
  messages: (Message.Type & { user: User; files: File.Type[] })[];
  files: (File.Type & { user: User })[];
  activities: (Activity.Type & { user: User })[];
  reviews: (Review.Type & { user: User })[];
  client: User;
};
export const getOrderById = async (orderId: Order.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select(
        `*, client:clients(id, name, email, picture_url, created_at), 
        messages(*, user:accounts(id, name, email, picture_url), files(*)), 
        activities(*, user:accounts(id, name, email, picture_url)),
          reviews(*, user:accounts(id, name, email, picture_url)), 
          files(*, user:accounts(id, name, email, picture_url))
        `,
      )
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError.message;

    const proccesedData = {
      ...orderData,
      messages: orderData.messages.map((message) => {
        return {
          ...message,
          user: message.user,
        };
      }),
    };

    console.log('a', orderData.messages[0]?.user, proccesedData);

    return proccesedData as OrderWithAllRelations;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};