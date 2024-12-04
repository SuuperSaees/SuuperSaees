import { PageBody } from '@kit/ui/page';

import {
  getUserById,
  getUserRole,
} from '~/team-accounts/src/server/actions/members/get/get-member-account';
import {  getOrdersByUserId } from '~/team-accounts/src/server/actions/orders/get/get-order';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

import Member from './components/member';

export default async function MemberPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const id = params.id;
  const userRole = await getUserRole().catch((error) => {
    console.error('Error fetching user role in team member page:', error);
    return '';
  });

  const user = await getUserById(id).catch((error) => {
    console.error('Error fetching user in team member page:', error);
    return null;
  });

  if (!user) return null;

  const memberOrders = await getOrdersByUserId(id, true, 60, true).catch((error) => {
    console.error('Error fetching orders in team member page:', error);
    return [];
  }).then((res) => res?.success?.data);

  const agencyStatuses =
    (await getAgencyStatuses(memberOrders[0]?.agency_id).catch((err) => {
      console.error(err);
      return [];
    })) ?? [];

  return (
    <PageBody className="flex h-full flex-col gap-8">
      <Member
        id={id}
        userRole={userRole}
        user={user}
        orders={memberOrders}
        agencyStatuses={agencyStatuses}
      />
    </PageBody>
  );
}
