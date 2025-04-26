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
  const account = await loadAccount(params.id);

  return {
    title: `Admin | ${account.name}`,
  };
};

async function AccountPage({ params }: Params) {
  const account = await loadAccount(params.id);

  return (
    <PageBody className={'mx-auto flex w-full lg:px-16 p-8'}>
      <AdminAccountPage account={account} isPersonalAccount={true} />
    </PageBody>
  );
}

export default AdminGuard(AccountPage);

const loadAccount = cache(accountLoader);

async function accountLoader(id: string) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const { data, error } = await client
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const { data: memberships } = await client
    .from('accounts_memberships')
    .select('*')
    .eq('user_id', id);

  return { ...data, memberships };
}
