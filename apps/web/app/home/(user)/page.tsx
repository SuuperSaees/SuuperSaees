import { redirect } from 'next/navigation';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import { HomeAccountMetrics } from './_components/home-account-metrics';
import { HomeLayoutPageHeader } from './_components/home-page-header';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

export default async function UserHomePage() {
  const supabase = getSupabaseServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: userAccount, error: userAccountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userAccountError) {
    console.error('Error al obtener la cuenta del usuario', userAccountError);
    return;
  }

  const name = userAccount.name;
  const email = user.email ?? '';


  const { data: availableInvitations, error: availableInvitationsError } = await supabase
  .from('invitations')
  .select('*')
  .eq('email', email)
  .single();

  if (availableInvitations) {
    console.log('Tiene invitaciones pendientes');
    const invite_token = availableInvitations.invite_token;
    const email = availableInvitations.email;
    return redirect('/join?invite_token=' + invite_token + '&email=' + email);
  } else {
    console.log('No tiene invitaciones pendientes');
  }


  

  // const { data: accounts } = await supabase
  //   .from('accounts')
  //   .select('*')
  //   .eq('id', userAccount.organization_id ?? '')
  //   .eq('is_personal_account', false);

  if (!userAccount.organization_id) {
    console.log('No tiene organizaciones');
    return redirect('/add-organization');
  }
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