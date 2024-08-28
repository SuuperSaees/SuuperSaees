import { BellIcon } from 'lucide-react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { ClientsTable } from '@kit/team-accounts/components';
import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('clients:title'),
  };
};

async function ClientsMembersPage() {
  const client = getSupabaseServerComponentClient();
  const { data: userData } = await client.auth.getUser();

  const { data: userAccountData, error: userAccountError } = await client
    .from('accounts')
    .select('organization_id')
    .eq('id', userData.user!.id)
    .single();

  if (userAccountError) console.error(userAccountError.message);

  const { data: agencyClients } = await client
    .from('clients')
    .select()
    .eq('agency_id', userAccountData?.organization_id ?? '');

  const clientOrganizationIds =
    agencyClients?.map((client) => client.organization_client_id) ?? [];

  const clientuserIds =
    agencyClients?.map((client) => client.user_client_id) ?? [];
  // bring the agencyClients

  const { data: clientOwners, error } = await client
    .from('accounts')
    .select('*, rol:accounts_memberships(*)')
    .in('id', clientuserIds);

  const { data: clientOrganizations } = await client
    .from('accounts')
    .select()
    .in('id', clientOrganizationIds)
    .eq('is_personal_account', false);

  const clientsWithOrganizations = clientOwners?.map((clientOwner) => {
    const organization = clientOrganizations?.find(
      (org) => org.id === clientOwner.organization_id,
    );
    const organizationName = organization?.name ?? '';
    return { ...clientOwner, client_organization: organizationName };
  });

  if (error) console.error(error.message);

  // console.log('clientIds', clientsWithOrganizations);

  return (
    <PageBody>
      <div className="p-[35px]">
        <div className="mb-[32px] flex items-center justify-between">
          <div className="flex-grow">
            <span>
              <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                <Trans i18nKey={'clients:client'} />
              </div>
            </span>
          </div>
        </div>
        {clientOwners ? (
          <ClientsTable
            clients={clientsWithOrganizations ?? []}
            // accountIds={accountIds}
            // accountNames={accountNames}
          />
        ) : (
          <p>No clients available</p>
        )}
      </div>
    </PageBody>
  );
}

export default withI18n(ClientsMembersPage);
