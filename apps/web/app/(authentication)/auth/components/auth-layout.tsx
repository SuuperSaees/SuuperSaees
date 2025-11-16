'use client';

import { ReactNode } from 'react';

import { AuthDetails } from '@kit/auth/sign-in';

import { AppLogo } from '~/components/app-logo';
import { cn } from '@kit/ui/utils';

interface AuthLayoutProps {
  children: ReactNode;
  authDetails: AuthDetails | null;
  isLoading: boolean;
  className?: string;
}

export const AuthLayout = ({
  children,
  authDetails,
  isLoading = false,
  className,
}: AuthLayoutProps) => {
  const defaultBackgroundURL =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    '/storage/v1/object/public/suuper/auth_sign_in_background.webp';
  const customBackgroundURL = authDetails?.auth_background_url;

  if (isLoading) {
    return null;
  }
  return (
    <div className={cn('flex h-full w-full justify-between text-center', className)}>
      {/* Left Content Container */}
      <div className="flex w-full flex-col items-start justify-start p-10">
        <AppLogo
          logoUrl={authDetails?.logo_url}
          className="max-h-[36px] w-auto"
        />
        <div className="font-inter m-auto w-full max-w-sm">{children}</div>
      </div>

      {/* Right Image background container */}
      <div
        className="relative hidden h-full w-full max-w-2xl border-[16px] border-white sm:block"
        style={{
          background: customBackgroundURL
            ? `url(${customBackgroundURL}) lightgray 50% / cover no-repeat`
            : authDetails?.theme_color
              ? `linear-gradient(0deg, ${authDetails.theme_color} 0%, ${authDetails.theme_color} 100%), url(${defaultBackgroundURL}) lightgray 50% / cover no-repeat`
              : `url(${defaultBackgroundURL}) lightgray 50% / cover no-repeat`,
          backgroundBlendMode: customBackgroundURL
            ? 'normal'
            : authDetails?.theme_color
              ? 'overlay, normal'
              : 'normal',
          borderRadius: '28px',
          backgroundSize: 'cover',
        }}
      >
        {/* Overlay */}
        {/* <div
          className="absolute inset-0 bg-transparent opacity-50 "
          style={{
           
          }}
        ></div> */}
      </div>
    </div>
  );
};
