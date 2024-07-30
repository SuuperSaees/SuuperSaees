import { Trans } from '@kit/ui/trans';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {
  ClientsTable,
} from '@kit/team-accounts/components';
import { Button } from '@kit/ui/button';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { BellIcon } from 'lucide-react';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  )
    return {
      title: i18n.t('clients:title'),
    };
};

  async function ClientsMembersPage() {
    const tags = Array.from({ length: 50 }).map(
      (_, i, a) => `v1.2.0-beta.${a.length - i}`
    )
    
    const client = getSupabaseServerComponentClient();

    const { data: userData } = await client.auth.getUser();


    const { data: dataClients} = await client
    .from('clients')
    .select()
    .eq('propietary_organization_id', userData.user!.id);


    return (
      
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
                <ClientsTable clients={dataClients} />
            ) : (
                <p>No clients available</p>
            )}
    </div>
    );
  }
  
  export default withI18n(ClientsMembersPage);