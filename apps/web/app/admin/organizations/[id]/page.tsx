import { cache } from 'react';

import { AdminAccountPage } from '@kit/admin/components/admin-account-page';
import { AdminGuard } from '@kit/admin/components/admin-guard';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export const generateMetadata = async (props: Params) => {
  const params = await props.params;
  const organization = await loadOrganization(params.id);

  return {
    title: `Admin | ${organization.name}`,
  };
};

async function OrganizationPage({ params }: Params) {
  const organization = await loadOrganization(params.id);

  return (
    <PageBody className={'mx-auto flex w-full lg:px-16 p-8'}>
      <AdminAccountPage account={organization} isPersonalAccount={false} />
    </PageBody>
  );
}

export default AdminGuard(OrganizationPage);

const loadOrganization = cache(organizationLoader);

async function organizationLoader(id: string) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const { data, error } = await client
    .from('organizations')
    .select('*, memberships: accounts_memberships (*)')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
