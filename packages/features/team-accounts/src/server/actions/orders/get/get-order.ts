'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Activity } from '../../../../../../../../apps/web/lib/activity.types';
import { File } from '../../../../../../../../apps/web/lib/file.types';
import { Message } from '../../../../../../../../apps/web/lib/message.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { Review } from '../../../../../../../../apps/web/lib/review.types';
import { User as ServerUser } from '../../../../../../../../apps/web/lib/user.types';
import { hasPermissionToReadOrderDetails, hasPermissionToReadOrders } from '../../permissions/permissions';


type User = Pick<ServerUser.Type, 'email' | 'id' | 'name' | 'picture_url'>;

type OrderWithAllRelations = Order.Relationships.All & {
  messages: (Message.Type & { user: User; files: File.Type[] })[];
  files: (File.Type & { user: User })[];
  activities: (Activity.Type & { user: User })[];
  reviews: (Review.Type & { user: User })[];
  client: User;
  assigned_to: {
    agency_member: User;
  }[];
};
export const getOrderById = async (orderId: Order.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select(
        `*, client:accounts!customer_id(id, name, email, picture_url, created_at), 
        messages(*, user:accounts(id, name, email, picture_url), files(*)), 
        activities(*, user:accounts(id, name, email, picture_url)),
          reviews(*, user:accounts(id, name, email, picture_url)), 
          files(*, user:accounts(id, name, email, picture_url)),
         assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url))
        `,
      )
      .eq('id', orderId)
      .single();

    const userHasReadMessagePermission = await hasPermissionToReadOrderDetails(
      orderId,
      orderData?.propietary_organization_id ?? '',
      orderData?.client_organization_id ?? '',
    );

    if (!userHasReadMessagePermission) throw 'Unauthorized access to order';

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

    return proccesedData as OrderWithAllRelations;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export async function getOrderAgencyMembers(
  agencyId: ServerUser.Type['organization_id'],
  orderId: Order.Type['id'],
) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError, data: userAuthenticatedData } =
      await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;
    const userId = userAuthenticatedData?.user?.id;

    // Retrieve authenticated account information
    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select()
      .eq('id', userId)
      .single();

    if (accountError) throw accountError;

    const { data: accountMembershipsData, error: accountMembershipsDataError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', userId)
      .single();

    if (accountMembershipsDataError) throw accountMembershipsDataError;

    // Retrieve the order
    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select()
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    if (accountMembershipsData.account_role !== 'agency_owner' && accountMembershipsData.account_role !== 'agency_member') {
      throw new Error('Unauthorized access to order agency members');
    }

    if (orderData.propietary_organization_id === accountData.organization_id) {
      const { data: agencyMembersData, error: agencyMembersError } = await client
      .from('accounts')
      .select()
      .eq('organization_id', agencyId ?? accountData.organization_id);

      if (agencyMembersError) throw agencyMembersError;
      return agencyMembersData;
    }
    
    const { data: agencyMembersData, error: agencyMembersError } = await client
      .from('accounts')
      .select('id, name, email, picture_url')
      .eq('organization_id', agencyId ?? accountData.primary_owner_user_id);

    if (agencyMembersError) throw agencyMembersError;

    return agencyMembersData;
  } catch (error) {
    console.error('Error fetching order agency members:', error);
    throw error;
  }
}

export const getOrders = async () => {
  try {
    const orders = await hasPermissionToReadOrders();
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};
