import Link from 'next/link';

import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { AppLogo } from '~/components/app-logo';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signUp'),
  };
};

interface Props {
  searchParams: {
    invite_token?: string;
  };
}

const paths = {
  callback: pathsConfig.auth.callback,
  appHome: pathsConfig.app.home,
};

function SignUpPage({ searchParams }: Props) {
  const inviteToken = searchParams.invite_token;

  const signInPath =
    pathsConfig.auth.signIn +
    (inviteToken ? `?invite_token=${inviteToken}` : '');

  return (
    <>
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center">
      <div className='hidden md:block absolute md:w-[160px] md:h-auto md:left-8 md:top-8 md:object-contain'>
        <AppLogo></AppLogo>
      </div>
        <div className="w-full md:w-1/2 ">

          <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px] hidden md:block text-start mb-[32px]">
            <Trans i18nKey={'auth:signUpHeading'} />
          </div>
          <img
            src="/images/logo/Suuper_Logo_Small.svg"
            alt="SuuperLogoSmall"
            className="md:hidden mb-6"
          />
          <div className='text-start text-[24px] mb-[8px]'>
          <span className='font-inter text-gray-900 font-semibold text-[24px] leading-32 tracking-tight leading-32 mb-2 md:hidden text-start'>Convierte tu negocio de servicios en una suscripción</span>
          </div>
          <div className='text-start text-[16px] mb-[32px]'>
          <span className='font-inter text-gray-900 font-regular text-[16px] leading-32 tracking-tight leading-32 mb-[32px] md:hidden text-start'>Gratis durante 14 días, sin añadir tu tarjeta. </span>
          </div>

          <SignUpMethodsContainer
            providers={authConfig.providers}
            displayTermsCheckbox={authConfig.displayTermsCheckbox}
            inviteToken={inviteToken}
            paths={paths}
          />

          <div className="flex justify-center mt-4 items-center">
            <div className='text-xs'>
              <Trans i18nKey={'auth:alreadyHasAccountAsking'} />
            </div>
            <Button asChild variant={'link'} size={'sm'} className='text-indigo-500 font-bold'>
              <Link href={signInPath}>
                <Trans i18nKey={'auth:alreadyHasAccountAnswer'} />
              </Link>
            </Button>
          </div>
        </div>
        <div className="leading-5 absolute bottom-8 flex justify-between w-1/2 hidden md:flex">
            <div className='text-[#475467] font-inter text-sm font-normal pl-10'>© Suuper 2024</div>
            <div className='flex gap-2 items-center'>
              <div className="text-[#475467] font-inter text-sm font-normal">
                <img
                  src="/images/icons/mail-01.svg"
                  alt="mailicon"  
                >
                </img>
              </div>
              <div className="text-[#475467] font-inter text-sm font-normal pr-10">soporte@suuper.co</div>
            </div>
        </div>

      </div>

      <div className='hidden md:flex md:w-1/2 h-screen flex items-center justify-center  bg-no-repeat' style={{
        backgroundImage: "url('/images/oauth/signUpBackground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center"
        }}>
        <div className='w-full md:w-full mt-56 py-[96px] px-[64px]'>
          <div>
            <img 
              src="/images/oauth/stars.png" 
              alt="Stars" 
              className="" 
            />  
          </div>
          <div className='text-white font-semibold text-6xl leading-72 tracking-[-2%] leading-72 text-left mb-[20px]'>
          Convierte tu negocio de servicios, en una suscripción.
          </div>
          <div className='font-inter text-white text-medium leading-28 tracking-tight leading-28 text-left mb-[32px]'>
          Comienza a vender tus servicios de diseño de manera recurrente. <br></br> Gratis durante 14 días, sin necesidad de añadir tu tarjeta.
          </div>
          <div className='flex gap-4'>
            <img 
              src="/images/oauth/avatarGroup.png" 
              alt="AvatarGroup" 
              className="" 
            />  
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
                <img 
                  src="/images/oauth/califications.png" 
                  alt="Califications" 
                  className="" 
                />
                <div className='text-white font-inter text-[16px] font-semibold leading-[24px]'>
                  5.0
                </div>
              </div>
              <div className='text-white font-inter text-[16px] font-semibold leading-[24px] text-left'>
                200+ reseñas
              </div>
              
            </div>

          </div>

          {/* <SignUpMethodsContainer
            providers={authConfig.providers}
            displayTermsCheckbox={authConfig.displayTermsCheckbox}
            inviteToken={inviteToken}
            paths={paths}
          />

          <div className="flex justify-center mt-4">
            <Button asChild variant={'link'} size={'sm'}>
              <Link href={signInPath}>
                <Trans i18nKey={'auth:alreadyHaveAnAccount'} />
              </Link>
            </Button>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default withI18n(SignUpPage);
