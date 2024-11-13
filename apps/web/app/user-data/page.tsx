// import { getDomainByUserId } from '../../../../packages/multitenancy/utils/get/get-domain';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { UserDataForm } from './components/data-form';
import { getTokenData } from '~/team-accounts/src/server/actions/tokens/get/get-token';
import { redirect } from 'next/navigation';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:userDataPage');

  return {
    title,
  };
};



async function UserDataPage({
  searchParams: { tokenId },
} : {
  searchParams: { tokenId: string };
}) {
  const supabase = getSupabaseServerComponentClient();
  const token = await getTokenData(tokenId);
  if (!token) {
    redirect('/orders');
  }
  if(token.expires_at && new Date(token.expires_at).getTime() < new Date().getTime()) {
    redirect('/orders');
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError.message;
  // // const { domain: baseUrl } = await getDomainByUserId(userData?.user.id, true);

  return (
      <div className="w-full h-screen flex">
        <div className="w-1/2 h-full">
          <img
            src="/images/oauth/dataBackground.jpg"
            alt="Description"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-1/2 h-full p-6 overflow-y-auto items-center justify-center">
          <h1 className="text-2xl font-bold">User Data</h1>
          <UserDataForm userId={userData?.user.id} tokenId={tokenId} />
        </div>
      </div>
  );
}

export default withI18n(UserDataPage);



