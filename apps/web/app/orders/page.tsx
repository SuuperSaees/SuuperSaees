import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getAgencyStatuses } from '~/server/actions/statuses/statuses.action';
import { getTags } from '~/server/actions/tags/tags.action';
import {
  getAgencyForClient,
  getOrganization,
} from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

import { PageHeader } from '../components/page-header';
import { TimerContainer } from '../components/timer-container';
import { AgencyStatusesProvider } from './components/context/agency-statuses-context';
import { OrdersProvider } from './components/context/orders-context';
import ProjectsBoard from './components/projects-board';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

async function OrdersPage() {
  const client = getSupabaseServerComponentClient({
    admin: false,
  });

  const { workspace: userWorkspace } = await loadUserWorkspace();
  const userOrganization = await getOrganization();
  const agencyRoles = [
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ];

  const agency = agencyRoles.includes(userWorkspace.role ?? '')
    ? userOrganization
    : await getAgencyForClient();
  const agencyId = agency?.id ?? '';
  const agencyStatuses =
    (await getAgencyStatuses(agencyId ?? '').catch(() => [])) ?? [];

  const { data, error: membersError } = await client.rpc(
    'get_account_members',
    {
      organization_slug: agency?.slug ?? '',
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
        picture_url: member.settings?.picture_url ?? member.picture_url,
        name: member.settings?.name ?? member.name,
      },
    })) ?? [];


  const tags = await getTags(agencyId ?? '');

  return (
    <OrdersProvider
      agencyMembers={agencyMembers ?? []}
      agencyId={agencyId ?? ''}
    >
      <AgencyStatusesProvider
        initialStatuses={agencyStatuses ?? []}
        agencyMembers={agencyMembers ?? []}
      >
        <PageBody className="h-screen">
          <div className="flex h-full max-h-full min-h-0 flex-1 flex-col p-[35px]">
            <PageHeader
              title="orders:title"
              rightContent={<TimerContainer />}
            />
            {/* {agencyRoles.includes(userWorkspace.role ?? '') ? (
              <PageHeader
                title="orders:title"
                rightContent={<TimerContainer />}
              />
            ) : (
              <Header
                name={userOrganization.name ?? ''}
                logo={userOrganization.picture_url ?? ''}
                id={userOrganization.id ?? ''}
                currentUserRole={userWorkspace.role ?? ''}
                className="mb-6 flex items-center gap-2"
                imageClassName="aspect-square h-8 w-8 flex-shrink-0"
                contentClassName="flex flex-col justify-center"
              />
            )} */}
            <ProjectsBoard
              agencyMembers={agencyMembers.map((member) => ({
                id: member.id,
                organization_id: member.organization_id,
                role: member.role,
              }))}
              tags={tags}
            />
            {/* {
              agencyRoles.includes(userWorkspace.role ?? '') ? (
                <ProjectsBoard agencyMembers={agencyMembers.map(member => ({
                  organization_id: member.account_id,
                  settings: member.user_settings,
                  role: member.role
                }))} tags={tags} />
              ) : (
                <SectionView 
                  clientOrganizationId={userOrganization.id ?? ''} 
                  currentUserRole={userWorkspace.role ?? ''} 
                  agencyId={agencyId ?? ''} 
                  sections={['orders']}
                  showCardStats={false}
                />
              )
            } */}
          </div>
        </PageBody>
      </AgencyStatusesProvider>
    </OrdersProvider>
  );
}

export default withI18n(OrdersPage);
