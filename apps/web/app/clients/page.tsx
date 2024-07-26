import { PageBody } from '@kit/ui/page';
import { PlusCircle } from 'lucide-react';
import { Trans } from '@kit/ui/trans';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  AccountInvitationsTable,
  ClientsTable,
  InviteMembersDialogContainer,
} from '@kit/team-accounts/components';
import { If } from '@kit/ui/if';
import { Button } from '@kit/ui/button';
import { loadMembersPageData } from './_lib/server/members-page.loader';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { TeamAccountLayoutPageHeader } from './components/team-account-layout-page-header';
import { ArrowRight, BellIcon } from 'lucide-react';
import { Separator } from '@kit/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from "@kit/ui/scroll-area" 
import { Badge } from '@kit/ui/badge';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  )
    return {
      title: i18n.t('clients:title'),
    };
};

type Account = {
    id: string;
    primary_owner_user_id: string;
    name: string;
    slug: string;
    email: string | null;
    is_personal_account: boolean;
    updated_at: string | null;
    created_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    picture_url: string | null;
    public_data: object;
    role_hierarchy_level: number;
    permissions: Array<'roles.manage' | 'billing.manage' | 'settings.manage' | 'members.manage' | 'invites.manage'>;
};

  
  async function ClientsMembersPage() {
    const tags = Array.from({ length: 50 }).map(
      (_, i, a) => `v1.2.0-beta.${a.length - i}`
    )
    
    const client = getSupabaseServerComponentClient();


    const { data: dataClients} = await client
    .from('clients')
    .select();

    // console.log('Data:', dataClients);


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