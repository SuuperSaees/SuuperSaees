import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import { HomeAccountMetrics } from './_components/home-account-metrics';
import { HomeLayoutPageHeader } from './_components/home-page-header';
import { loadUserWorkspace } from './_lib/server/load-user-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

export default async function UserHomePage() {
  const supabase = getSupabaseServerComponentClient();

  const { workspace } = await loadUserWorkspace();

  const name = workspace.name;
  const email = workspace.email ?? '';

  const { data: availableInvitations, error: availableInvitationsError } = await supabase
  .from('invitations')
  .select('*')
  .eq('email', email)
  .single();

  if (availableInvitations) {
    const invite_token = availableInvitations.invite_token;
    const email = availableInvitations.email;
  
    if (invite_token && email) {
      return redirect('/join?invite_token=' + invite_token + '&email=' + email);
    } else {
      console.error('Invitation data is missing'+ availableInvitationsError);
    }
  }

  // if (!workspace.organization_id) {
  //   return redirect('/add-organization');
  // }
  return redirect('/orders')
  return (
    <>
      <HomeLayoutPageHeader
        title={`Te damos la bienvenida, ${name}`}
        description=""
      />
      <PageBody className="space-y-4">
        <HomeAccountMetrics />
      </PageBody>
    </>
  );
}
