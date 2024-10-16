import { BellIcon } from 'lucide-react';
import { BriefsTable } from 'node_modules/@kit/team-accounts/src/components/briefs/briefs-table';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';

import { Brief } from '~/lib/brief.types';
import { Database } from '~/lib/database.types';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function BriefsPage() {
  const client = getSupabaseServerComponentClient<Database>();
  const { data: userData } = await client.auth.getUser();

  const { data: accountsData } = await client
    .from('accounts')
    .select()
    .eq('primary_owner_user_id', userData.user!.id);

  const filteredAccounts = accountsData?.filter(
    (account) => account.id === userData.user!.id,
  );

  const accountIds = filteredAccounts?.map((account) => account.id) ?? [];

  let briefs = null;

  if (accountIds.length > 0) {
    const firstAccountId = accountIds[0];

    if (firstAccountId) {
      const { data } = await client.from('briefs').select(`
          id,
          created_at,
          name,
          propietary_organization_id,
          services ( name )
          `);

      briefs = data as Brief.Type[];
    }
  }
  return (
    <PageBody>
      <div className="p-[35px]">
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <span>
              <div className="font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px] text-primary-900">
                Briefs
              </div>
            </span>
          </div>
        </div>
        {briefs ? (
          <BriefsTable briefs={briefs} accountIds={accountIds} />
        ) : (
          <p>No briefs available</p>
        )}
      </div>
    </PageBody>
  );
}

export default withI18n(BriefsPage);
