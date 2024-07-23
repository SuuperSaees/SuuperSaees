import Link from 'next/link';

import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

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
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full md:w-1/2">
          <Heading level={4}>
            <Trans i18nKey={'auth:signUpHeading'} />
          </Heading>

          <SignUpMethodsContainer
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
            <Button asChild variant={'link'} size={'sm'} className='text-indigo-500'>
              <Link href={signInPath}>
                <Trans i18nKey={'auth:signInAlreadyHaveAnAccount'} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className='hidden md:flex md:w-1/2 flex items-center justify-center'>
        <div className='w-full md:w-1/2'>
          <Heading level={1}>
            <Trans i18nKey='Convierte tu negocio' />
          </Heading>
          <Heading level={1}>
            <Trans i18nKey='de servicios, en una suscripción.' />
          </Heading>
          <div className='font-medium text-lg'>
            Comienza a vender tus servicios de diseño de manera recurrente, Gratis durante 14 días, sin necesidad de añadir tu tarjeta.
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
