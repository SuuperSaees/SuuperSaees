import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { loadUserWorkspace } from '~/(main)/home/(user)/_lib/server/load-user-workspace';
import {
  getUserById, // getUserRole,
} from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrganization } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getAgencyForClient } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
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

  const userOrganization = await getOrganization();
  const agencyRoles = [
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ];

  const agency = agencyRoles.includes(workspace?.role ?? '')
    ? userOrganization
    : await getAgencyForClient();
  const agencyId = agency?.id ?? '';

  const agencyStatuses =
    (await getAgencyStatuses(agencyId ?? '').catch(() => [])) ?? [];

  const { data, error: membersError } = await client.rpc(
    'get_account_members',
    {
      organization_slug: agencySlug ?? '',
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
    <PageBody className="flex h-full flex-col gap-8 ">
      <Member
        id={id}
        userRole={userRole ?? ''}
        user={user}
        agencyStatuses={agencyStatuses}
        agencyMembers={agencyMembers}
      />
    </PageBody>
  );
}
