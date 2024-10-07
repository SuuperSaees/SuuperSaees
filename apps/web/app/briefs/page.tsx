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
  // console.log('all', JSON.stringify(briefs));
  return (
    <PageBody>
      <div className="p-[35px]">
        <div className="mb-[32px] flex items-center justify-between">
          <div className="flex-grow">
            <span>
              <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                Briefs
              </div>
            </span>
          </div>
          <div className="flex space-x-4">
            <span>
              <Button variant="outline">
                Tu prueba gratuita termina en xx dias
              </Button>
            </span>
            <span>
              <Button variant="outline" size="icon">
                <BellIcon className="h-4 w-4" />
              </Button>
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
