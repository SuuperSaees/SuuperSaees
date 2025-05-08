import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { UserDataForm } from './components/data-form';
import { redirect } from 'next/navigation';
import { decodeTokenData } from '~/team-accounts/src/server/actions/tokens/decode/decode-token';
import { AppLogo } from '~/components/app-logo';
import { Trans } from '@kit/ui/trans';
import { getAccountOnbardingData } from '~/team-accounts/src/server/actions/accounts/get/get-account';
// import { getUserRoleById } from '~/team-accounts/src/server/actions/members/get/get-member-account';

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
  const tokendecoded = await decodeTokenData(tokenId);
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError.message;

  const accountData = await getAccountOnbardingData(userData.user.id);
  const userRole = (await supabase.rpc('get_current_role')).data ?? '';

  const sanitizedAccountData = accountData ? {
    ...accountData,
    name: accountData.name ?? '',
    phone_number: accountData.phone_number ?? '',
    subdomain: accountData.subdomain ?? ''
  } : null;

  if(tokendecoded) {
    if((tokendecoded.expires_at && new Date(tokendecoded.expires_at).getTime() < new Date().getTime() && sanitizedAccountData?.phone_number && sanitizedAccountData?.subdomain) ?? (userRole === 'agency_owner' && sanitizedAccountData?.phone_number && sanitizedAccountData?.subdomain)) {
      redirect('/orders');
    }
  } else {
    if( (userRole === 'agency_owner' && sanitizedAccountData?.phone_number && sanitizedAccountData?.subdomain ) ?? (userRole !== 'agency_owner' && sanitizedAccountData?.phone_number) ) {
      redirect('/orders');
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/2 h-screen sticky top-0">
        <img
          src="/images/oauth/dataBackground.avif"
          alt="Description"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
        <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex-1 px-4 py-6 sm:px-6 md:px-8 flex flex-col">
          

          <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
            <div className="hidden md:block w-full flex justify-center lg:justify-start mb-12">
              <AppLogo  />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center lg:text-left mb-8">
              <Trans i18nKey={'auth:signUpUserDataHeading1'} />
              <br />
              <Trans i18nKey={'auth:signUpUserDataHeading2'} />
            </h2>

            <UserDataForm userId={userData?.user.id} tokenId={tokenId} accountData={sanitizedAccountData} userRole={userRole ?? ''} />
          </div>
        </div>
        
        <footer className="w-full py-4 px-4 border-t">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-600">© Suuper 2024</div>
            <div className="flex items-center gap-2">
              <img 
                src="/images/icons/mail-01.svg" 
                alt="mail icon"
                className="w-5 h-5"
              />
              <span className="text-sm text-gray-600">soporte@suuper.co</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default withI18n(UserDataPage);



