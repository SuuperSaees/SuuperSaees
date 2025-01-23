import { Order } from '~/lib/order.types';
import { User } from '~/lib/user.types';

export const transformUserData = (
  users: User.Response[] | Order.Response['assigned_to'] = [],
) => {
  return (
    users?.map((user) => {
      const userData = 'agency_member' in user ? user.agency_member : user;

      return {
        id: userData?.id ?? '',
        name: userData?.settings?.name ?? userData?.name ?? '',
        picture_url:
          userData?.settings?.picture_url ?? userData?.picture_url ?? '',
        email: userData?.email ?? '',
      };
    }) ?? []
  );
};
