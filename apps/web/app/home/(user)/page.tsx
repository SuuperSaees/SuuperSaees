import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { PageBody } from '@kit/ui/page';
import { HomeLayoutPageHeader } from './_components/home-page-header';
import { HomeAccountMetrics } from './_components/home-account-metrics';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

export default async function UserHomePage() {
  const supabase = getSupabaseServerComponentClient();

  const { data: {user} } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login'); 
  }

  const { data: names} = await supabase
    .from('accounts')
    .select('*')
    .eq('id', user.id)

    const name = names?.[0]?.name;

    if (name) {
        console.log(name);
    } else {
        console.log('No data found or name is undefined');
    }



  const { data: accounts} = await supabase
    .from('accounts')
    .select('*')
    .eq('primary_owner_user_id', user.id)
    .eq('is_personal_account', false);

  if (accounts!.length === 0) {
    console.log('No tiene organizaciones');
    return redirect('/add-organization'); 
  }

  return (
    <>
      <HomeLayoutPageHeader title={`Te damos la bienvenida, ${name}`} description="" />
      <PageBody className="space-y-4">
        <HomeAccountMetrics />
      </PageBody>
    </>
  );
}
