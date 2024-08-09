import { Trans } from '@kit/ui/trans';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {
  ClientsTable,
} from '@kit/team-accounts/components';
import { Button } from '@kit/ui/button';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { BellIcon } from 'lucide-react';
import { PageBody } from '@kit/ui/page';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
    return {
      title: i18n.t('clients:title'),
    };
};

  async function ClientsMembersPage() {
    const client = getSupabaseServerComponentClient();
    const { data: userData } = await client.auth.getUser();

    const { data: accountsData} = await client.from('accounts').select().eq('primary_owner_user_id', userData.user!.id);

    const filteredAccounts = accountsData?.filter(account => account.id !== userData.user!.id);

    const accountIds = filteredAccounts?.map(account => account.id) ?? []; 

    const accountNames = filteredAccounts?.map(account => account.name) ?? [];

    const { data: dataClients} = await client
    .from('clients')
    .select()
    .eq('propietary_organization_id', accountIds[0] ?? '');

    return (
      <PageBody>
        <div className='p-[35px]'>
            <div className="flex justify-between items-center mb-[32px]">
                <div className="flex-grow">
                    <span>
                    <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                      <Trans i18nKey={'clients:client'} />
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
            {dataClients ? (
                    <ClientsTable clients={dataClients} accountIds={accountIds} accountNames={accountNames}  />
                ) : (
                    <p>No clients available</p>
                )}
        </div>
      </PageBody>
      
    );
  }
  
  export default withI18n(ClientsMembersPage);