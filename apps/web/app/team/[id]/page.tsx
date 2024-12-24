import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import {
  getUserById, // getUserRole,
} from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrdersByUserId } from '~/team-accounts/src/server/actions/orders/get/get-order';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

import Member from './components/member';

export default async function MemberPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;
  const client = getSupabaseServerComponentClient();

  const { workspace, organization } = await loadUserWorkspace();
  const userRole = workspace?.role;
  const agencySlug = organization?.slug;

  const user = await getUserById(id).catch((error) => {
    console.error('Error fetching user in team member page:', error);
    return null;
  });

  if (!user) return null;

  const memberOrders = await getOrdersByUserId(id, true, 60, true)
    .catch((error) => {
      console.error('Error fetching orders in team member page:', error);
      return [];
    })
    .then((res) => res?.success?.data);

  const agencyStatuses =
    (await getAgencyStatuses(memberOrders[0]?.agency_id).catch((err) => {
      console.error(err);
      return [];
    })) ?? [];

  const { data, error: membersError } = await client.rpc(
    'get_account_members',
    {
      account_slug: agencySlug ?? '',
    },
  );
  let agencyMembers = [];
  if (membersError) {
    console.error('Error fetching agency members:', membersError);
    agencyMembers = [];
  }
  agencyMembers =
    data?.map((member) => ({
      ...member,
      role: member.role.toLowerCase(),
      user_settings: {
        picture_url: member.picture_url,
        name: member.name,
      },
    })) ?? [];
  return (
    <PageBody className="flex h-full flex-col gap-8 p-8 py-8 lg:px-8">
      <Member
        id={id}
        userRole={userRole ?? ''}
        user={user}
        orders={memberOrders}
        agencyStatuses={agencyStatuses}
        agencyMembers={agencyMembers}
      />
    </PageBody>
  );
}
