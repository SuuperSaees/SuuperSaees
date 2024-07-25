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
  AccountMembersTable,
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

  
  async function ClientsMembersPage() {
    const tags = Array.from({ length: 50 }).map(
      (_, i, a) => `v1.2.0-beta.${a.length - i}`
    )
    
    // const client = getSupabaseServerComponentClient();
  
    // Asigna directamente el objeto account
    const account = {
      id: '5deaa894-2094-4da3-b4fd-1fada0809d1c',
      name: 'Makerkit',
      picture_url: null,
      slug: 'makerkit',
      role: 'owner',
      role_hierarchy_level: 1,
      primary_owner_user_id: '31a03e74-1639-45b6-bfa7-77447f1a4762',
      subscription_status: null,
      permissions: [
        'roles.manage',
        'billing.manage',
        'settings.manage',
        'members.manage',
        'invites.manage',
      ],
    };

    // const [members, invitations, canAddMember, { user }] =
    //   await loadMembersPageData(client, account);
    // const [members, invitations, canAddMember, { user }] =
    //     await loadMembersPageData(client, account.slug);
  
    // const canManageRoles = account.permissions.includes('roles.manage');
    // const canManageInvitations = account.permissions.includes('invites.manage');
  
    // const isPrimaryOwner = account.primary_owner_user_id === user.id;
    // const currentUserRoleHierarchy = account.role_hierarchy_level;

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
        <div className="flex justify-between items-center mb-5">
            <div className="flex">
                <button className="rounded-[6px] bg-[var(--Brand-50,#F9F5FF)] flex h-[36px] px-[12px] py-[8px] items-center gap-[8px]">
                    <span className="text-brand-700 font-sans text-[14px] font-semibold leading-[20px]">
                        Clientes
                    </span>
                </button>
                <button className="rounded-[6px] flex h-[36px] px-[12px] py-[8px] items-center gap-[8px]">
                    <span className="text-gray-500 font-sans text-[14px] font-semibold leading-[20px]">
                    Organizaciones
                    </span>
                </button>
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

        <Card x-chunk="dashboard-05-chunk-3" className='h-[80vh] max-h-full overflow-hidden'>
            <Separator />
            <div className='h-10 bg-[#F9FAFB] px-5 py-2 flex flex-wrap justify-between text-sm text-[#475467] font-medium'>
                <h1>Nombre</h1>
                <h1>Rol</h1>
                <h1>Organizaciones gestionadas</h1>
                <h1>Creado en</h1>
                <div className="invisible">Espacio vacío</div>
                
            </div>
            <Separator />

            <ScrollArea className="h-[80%] w-full">
                
                <div>
                    {tags.map((tag) => (
                    <>
                        
                        <div role="status" className="animate-pulse">
                            <div className="flex items-center justify-center mt-4">
                                <svg className="w-8 h-8 text-gray-200 dark:text-gray-700 me-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                </svg>
                                <div className="w-24 h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 me-3"></div>
                                <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700 me-3"></div>
                                <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700 me-4"></div>
                                <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700 me-5"></div>
                            </div>
                            <span className="sr-only">Loading...</span>
                        </div>

                        <Separator className="my-2" />
                    </>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    </div>
    );
  }
  
  export default withI18n(ClientsMembersPage);