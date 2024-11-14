// import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
// import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
// import { withI18n } from '~/lib/i18n/with-i18n';
// import { UserDataForm } from './components/data-form';
// import { redirect } from 'next/navigation';
// import { decodeTokenData } from '~/team-accounts/src/server/actions/tokens/decode/decode-token';
// import { AppLogo } from '~/components/app-logo';
// import { Trans } from '@kit/ui/trans';

// export const generateMetadata = async () => {
//   const i18n = await createI18nServerInstance();
//   const title = i18n.t('account:userDataPage');

//   return {
//     title,
//   };
// };



// async function UserDataPage({
//   searchParams: { tokenId },
// } : {
//   searchParams: { tokenId: string };
// }) {
//   const supabase = getSupabaseServerComponentClient();
//   const tokendecoded = await decodeTokenData(tokenId);

//   if (!tokendecoded) {
//     redirect('/orders');
//   }
//   if(tokendecoded.expires_at && new Date(tokendecoded.expires_at).getTime() < new Date().getTime()) {
//     redirect('/orders');
//   }
//   const { data: userData, error: userError } = await supabase.auth.getUser();
//   if (userError) throw userError.message;

//   return (
//     <div className="w-full h-screen flex flex-col md:flex-row">
//       <div className="hidden md:block md:w-1/2 h-full">
//         <img
//           src="/images/oauth/dataBackground.jpg"
//           alt="Description"
//           className="w-full h-full object-cover"
//         />
//       </div>
//       <div className="w-full md:w-1/2 h-full p-6 overflow-y-auto flex flex-col items-center justify-center relative">
//         <div className="w-full max-w-md">
//           <div className={`hidden lg:left-8 lg:top-8 lg:block lg:h-auto w-full md:object-contain`}>
//             <AppLogo  />
//           </div>
//           <h2 className={`text-black text-5xl font-semibold leading-[48px] tracking-[-0.252px] my-12`}>
//             <Trans i18nKey={'auth:signUpUserDataHeading'} />
//           </h2>
//           <UserDataForm userId={userData?.user.id} tokenId={tokenId} />
//         </div>
        
//         <div className="absolute bottom-0 left-0 right-0 flex w-full justify-between leading-5 p-4 bg-white">
//           <div className="font-inter pl-10 text-sm font-normal text-[#475467]">
//             © Suuper 2024
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="font-inter text-sm font-normal text-[#475467]">
//               <img src="/images/icons/mail-01.svg" alt="mailicon" />
//             </div>
//             <div className="font-inter pr-10 text-sm font-normal text-[#475467]">
//               soporte@suuper.co
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default withI18n(UserDataPage);



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { UserDataForm } from './components/data-form';
import { redirect } from 'next/navigation';
import { decodeTokenData } from '~/team-accounts/src/server/actions/tokens/decode/decode-token';
import { AppLogo } from '~/components/app-logo';
import { Trans } from '@kit/ui/trans';

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

  if (!tokendecoded) {
    redirect('/orders');
  }
  if(tokendecoded.expires_at && new Date(tokendecoded.expires_at).getTime() < new Date().getTime()) {
    redirect('/orders');
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError.message;

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/2 h-screen sticky top-0">
        <img
          src="/images/oauth/dataBackground.jpg"
          alt="Description"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 min-h-screen p-4 sm:p-6 flex flex-col items-center justify-between">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <div className="flex-1 flex flex-col">
            <div className={`hidden lg:block w-full md:object-contain py-8`}>
              <AppLogo  />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-[-0.252px] mb-8 md:mb-12">
              <Trans i18nKey={'auth:signUpUserDataHeading'} />
            </h2>
            <UserDataForm userId={userData?.user.id} tokenId={tokenId} />
          </div>
        </div>
        
        <div className="w-full mt-8 py-4 px-4 sm:px-6 bg-white">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-normal text-[#475467]">
              © Suuper 2024
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[#475467]">
                <img src="/images/icons/mail-01.svg" alt="mailicon" />
              </div>
              <div className="text-sm font-normal text-[#475467]">
                soporte@suuper.co
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(UserDataPage);



