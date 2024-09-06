import Link from 'next/link';

import { SignInMethodsContainer } from '@kit/auth/sign-in';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { AppLogo } from '~/components/app-logo';

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
        <div className="hidden md:block absolute md:w-[142px] md:h-auto md:left-8 md:top-8 md:object-contain">
          <AppLogo />
            </div>
              <div className="w-full md:w-1/2 md:px-[32px]">
                <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                  <Trans i18nKey={'auth:signInHeading'} />
                </div>
                <SignInMethodsContainer
                  providers={authConfig.providers}
                  inviteToken={inviteToken}
                  paths={paths}
                />
                <div className="flex justify-center mt-4 text-xs flex items-center">

                      <Trans i18nKey={'auth:alreadyHaveAnAccount'} />

                  <Button asChild variant={'link'} size={'sm'} className='text-indigo-500'>
                    <Link href={signUpPath} className='text-brand-700 font-inter font-semibold text-xs leading-[20px] tracking-normal leading-[20px] space-y-3 block'>
                      <Trans i18nKey={'auth:signInAlreadyHaveAnAccount'} />
                    </Link>
                  </Button>
                </div>
              </div>
      </div>

      <div className="relative w-full md:w-1/2 py-4 px-4 md:px-8 h-full hidden md:block">
          <img src="/images/oauth/loginBackground.png" alt="Placeholder Image" className="shadow-sm rounded-xl w-full h-full object-cover"/>
          <div className="backdrop-blur-md bg-white/30 absolute bottom-4 left-4 right-4 md:left-8 md:right-8 w-auto h-1/3 rounded-b-xl p-4 md:p-6 flex flex-col border-t" style={{ borderColor: 'rgba(200, 200, 200, 0.5)' }}>
            <div className="md-custom:text-2xl text-white text-justify text-xl font-semibold leading-tight md:leading-38 mb-4">
              <Trans i18nKey={'marketing:suuperRecomendation1'} />
            </div>
            <div className="hidden lg-custom:flex justify-between items-center">
              <div className="text-white font-inter font-semibold text-xl md:text-3xl leading-tight md:leading-11 tracking-normal md:tracking-[-0.0125em] space-y-9">
                Mariana Mejía
              </div>
              <div className="flex space-x-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/>
                </svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/>
                </svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/>
                </svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/>
                </svg>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.465 10 1 6.827l6.122-.56L10 1l2.878 5.267L19 6.827 14.535 10l1.343 8.09z"/>
                </svg>
              </div>
            </div>
            <div className="hidden lg-custom:flex justify-between items-center">
              <div className="items-start">
                <span className="text-white font-inter font-semibold text-sm md:text-base leading-tight md:leading-[28px] tracking-normal block">
                  <Trans i18nKey={'marketing:marianaCeo'} />
                </span>
                <span className="text-white font-inter font-medium text-xs md:text-sm leading-tight md:leading-[24px] tracking-normal block text-left">
                  <Trans i18nKey={'marketing:marianaOrg'} />
                </span>
              </div>
              <div className="flex space-x-2">
                <svg className="w-9 h-9 md:w-13 md:h-13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8L8 12M8 12L12 16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <svg className="w-9 h-9 md:w-13 md:h-13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L16 12M16 12L12 8M16 12H8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
</div>










    </>
  );
}

export default withI18n(SignInPage);



