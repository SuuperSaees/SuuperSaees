import Link from 'next/link';

import { SignInMethodsContainer } from '@kit/auth/sign-in';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

interface SignInPageProps {
  searchParams: {
    invite_token?: string;
  };
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signIn'),
  };
};

const paths = {
  callback: pathsConfig.auth.callback,
  home: pathsConfig.app.home,
  joinTeam: pathsConfig.app.joinTeam,
};

function SignInPage({ searchParams }: SignInPageProps) {
  const inviteToken = searchParams.invite_token;

  const signUpPath =
    pathsConfig.auth.signUp +
    (inviteToken ? `?invite_token=${inviteToken}` : '');

  return (
    <>
  

<div className="w-full md:w-1/2 h-screen flex items-center justify-center">
        <img
          src="/images/logo/Suuper_Logo.svg"
          alt="SuuperLogo"
          className="hidden md:block absolute md:w-[142px] md:h-auto md:left-8 md:top-8 md:object-contain"
        />
        <div className="w-full md:w-1/2 md:px-[32px]">
          <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
            <Trans i18nKey={'auth:signInHeading'} />
          </div>
          <SignInMethodsContainer
            providers={authConfig.providers}
            inviteToken={inviteToken}
            paths={paths}
          />
          <div className="flex justify-center mt-4">
            <Button asChild variant={'link'} size={'sm'}>
              <Link href={signUpPath}>
                <Trans i18nKey={'auth:alreadyHaveAnAccount'} />
              </Link>
            </Button>
            <Button asChild variant={'link'} size={'sm'} className='text-indigo-500'>
              <Link href={signUpPath}>
                <Trans i18nKey={'auth:signInAlreadyHaveAnAccount'} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-1/2 py-4 px-8 h-full">
          <img src="/images/oauth/loginBackground.png" alt="Placeholder Image" className="shadow-sm rounded-xl w-full h-full object-cover"/>
          <div className="backdrop-blur-md bg-white/30 absolute bottom-4 left-8 right-8 w-auto h-1/3 rounded-b-xl p-6 flex flex-col space-y-4 border-t" style={{ borderColor: 'rgba(200, 200, 200, 0.5)' }}>
            
            <div className="text-white text-justify text-2xl">
              <Trans i18nKey={'marketing:suuperRecomendation1'} />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-3xl text-white">
                Mariana Mejía
              </div>
              <div className="flex space-x-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/></svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/></svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/></svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/></svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/></svg>
              </div>
            </div>
            
            <div className="flex justify-between items-center">

              <div className="text-white">
                <Trans i18nKey={'marketing:marianaCeo'} /> <br/> <Trans i18nKey={'marketing:marianaOrg'} />
              </div>

              <div className="flex space-x-2">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                  <path d="M12 8L8 12M8 12L12 16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                  <path d="M12 16L16 12M16 12L12 8M16 12H8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

            </div>
          </div>
        </div>








    </>
  );
}

export default withI18n(SignInPage);
