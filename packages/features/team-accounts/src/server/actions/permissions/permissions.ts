'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const permissions = {
  message_order: {
    canRead: async (
      message_order_id: number,
      message_order_propietary_organization_id: string,
      userId: string,
      accountId: string,
    ) => {
      // Only client members/owners of the order and agency members assigned to the order can chat

      const client = getSupabaseServerComponentClient();
      const { data: userData, error: userError } = await client.auth.getUser();

      if (userError) throw userError.message;

      // First check for general permission on the account, be either client or agency
      const { data: hasPermission, error: permissionError } = await client.rpc(
        'has_permission',
        {
          user_id: userId,
          account_id: accountId,
          permission_name: 'messages.read',
        },
      );

      if (permissionError) {
        console.error('Error checking permission:', permissionError);
        throw new Error('The account has not permissions to READ messages');
      }

      // Add extra security or specific permissions for the order and user
      let hasStrictPermission = false;

      // Restriction for agency team:

      // The agency owner can read messages if the order was made to its organization
      if (message_order_propietary_organization_id === userData.user.id) {
        hasStrictPermission = true;
        return hasPermission && hasStrictPermission;
      }

      // The agency team members can read messages if they were assigned to the order
      const {
        data: agencyMemberAssignedToOrder,
        error: agencyOrderAssignationsError,
      } = await client
        .from('order_assignations')
        .select()
        .eq('agency_member_id', userData.user.id)
        .eq('message_order_id', message_order_id)
        .single();

      if (agencyOrderAssignationsError) {
        console.error(
          'Error fetching agency order assignations:',
          agencyOrderAssignationsError,
        );
        throw agencyOrderAssignationsError.message;
      }

      if (agencyMemberAssignedToOrder) {
        hasStrictPermission = true;
        return hasPermission && hasStrictPermission;
      } else return false;
    },
  },
};
