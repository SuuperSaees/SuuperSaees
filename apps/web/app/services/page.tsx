import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {
  ServicesTable,
} from '../../../../packages/features/team-accounts/src/components/services/services-table';
import { Button } from '@kit/ui/button';
import { BellIcon } from 'lucide-react';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Database } from '~/lib/database.types';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function UserHomePage() {
    const client = getSupabaseServerComponentClient<Database>();
    const { data: userData } = await client.auth.getUser();

    const { data: accountsData} = await client.from('accounts').select().eq('primary_owner_user_id', userData.user!.id);

    const filteredAccounts = accountsData?.filter(account => account.id !== userData.user!.id);

    const accountIds = filteredAccounts?.map(account => account.id) ?? []; 

    const accountNames = filteredAccounts?.map(account => account.name) ?? [];

    let dataServices = null;

    if (accountIds.length > 0) {
      const firstAccountId = accountIds[0];
  
      if (firstAccountId) {  
        const { data } = await client
          .from('services')
          .select()
          .eq('propietary_organization_id', firstAccountId);
        // dataServices = data;
        dataServices = data?.map(service => ({
          ...service,
          id: service.id, 
          name: service.name ?? '', 
          price: service.price ?? 0, 
          number_of_clients: service.number_of_clients ?? 0, 
          status: service.status ?? 'unknown', 
          propietary_organization_id: service.propietary_organization_id ?? '', 
        }));
      }
    }
  

  return (
    <>
    <PageBody>
        <div className='p-[35px]'>
            <div className="flex justify-between items-center mb-[32px]">
                <div className="flex-grow">
                    <span>
                    <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                      Servicios
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
            {dataServices ? (
                    <ServicesTable services={dataServices} accountIds={accountIds} accountNames={accountNames}  />
                ) : (
                    <p>No clients available</p>
                )}
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
