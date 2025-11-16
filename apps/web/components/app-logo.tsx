'use client';

import { cn } from '@kit/ui/utils';
import Link from 'next/link';

import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { getColorLuminance } from '~/utils/generate-colors';

export function LogoImage({ className }: { className?: string }) {
  return (
    <svg 
      width="142" 
      height="32" 
      viewBox="0 0 373 83" 
      preserveAspectRatio="xMinYMid meet"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M185.136 83L199.554 1.76176H216.698L214.57 12.1614C219.531 3.27372 226.514 0 235.612 0C249.923 0 256.893 9.93949 256.893 22.6794C256.893 36.8261 247.902 58.7955 227.445 58.7955C217.988 58.7955 211.95 55.2851 209.596 48.0409L203.092 82.9869H185.122L185.136 83ZM238.578 23.3894C238.578 17.8937 235.386 14.3833 229.001 14.3833C215.754 14.3833 211.152 28.53 211.152 35.301C211.152 41.1385 214.703 44.4122 221.327 44.4122C234.215 44.4122 238.591 29.332 238.591 23.3762L238.578 23.3894Z" fill="black"/>
      <path d="M0.0132351 50.7837L2.71319 35.8039C8.24545 43.7545 18.357 44.7023 26.0069 44.7023C37.7729 44.7023 42.2464 41.8985 42.2464 38.3839C42.2464 36.2778 41.0684 35.1063 37.4156 35.1063C31.7642 35.1063 28.1245 37.3309 19.7732 37.3309C7.42488 37.3309 3.65288 30.0779 3.65288 22.825C3.66612 11.7021 10.019 0 35.6685 0C51.4315 0 58.1417 4.80457 60.3784 7.3714L57.5593 20.8242C55.0844 17.665 48.8507 13.9135 37.7861 13.9135C25.3187 13.9135 20.3688 16.8357 20.3688 20.8242C20.3688 22.5749 21.1894 23.8649 24.1275 23.8649C30.3613 23.8649 36.9523 21.4034 43.186 21.4034C54.8329 21.4034 58.7108 28.5378 58.7108 35.9092C58.7108 45.0313 54.4756 58.7211 26.126 58.7211C11.0645 58.7211 3.65288 54.5089 0 50.7705L0.0132351 50.7837Z" fill="black"/>
      <path d="M316.702 57.0272L326.41 1.63947H342.893L339.972 17.1423C344.537 4.78724 351.43 0 357.626 0C365.466 0 368.623 4.07899 369.675 7.58089L366.755 24.7232C365.005 20.172 361.848 17.3783 356.468 17.3783C348.865 17.3783 340.446 22.9788 338.578 33.7074L334.487 57.0272H316.702Z" fill="black"/>
      <path d="M258.032 35.288C258.032 18.5275 268.297 0 291.909 0C307.26 0 316.702 7.38464 316.702 17.6968C316.702 30.1188 303.25 35.5122 279.864 35.5122H276.093C275.15 42.3166 280.462 44.532 288.841 44.532C299 44.532 308.203 41.3672 313.634 36.91L310.208 53.209C306.317 56.3738 297.46 58.7211 286.716 58.7211C268.536 58.7211 258.032 51.798 258.032 35.2749V35.288ZM282.241 24.9627C295.932 24.9627 300.899 22.6155 300.899 17.8155C300.899 14.6506 297.951 13.2396 293.223 13.2396C284.127 13.2396 279.293 18.3957 277.872 24.9627H282.241Z" fill="black"/>
      <path d="M69.3569 1.69388H87.2942L82.1373 30.6207C81.7811 32.7197 81.5569 34.5826 81.5569 36.1044C81.5569 40.6566 83.4298 43.2147 89.0616 43.2147C95.9859 43.2147 102.422 36.4454 103.833 28.1675L108.634 1.69388H126.453L116.601 57.0944H99.2436L101.591 45.1957C97.3708 53.8278 90.3409 58.7211 81.1876 58.7211C70.3989 58.7211 62.6568 53.0013 62.6568 41.6929C62.6568 39.9482 62.8942 38.1902 63.2372 36.2093L69.3569 1.69388Z" fill="black"/>
      <path d="M152.449 1.69388L147.246 30.6207C146.887 32.7197 146.661 34.5826 146.661 36.1044C146.661 40.6566 148.551 43.2147 154.233 43.2147C161.219 43.2147 167.713 36.4454 169.136 28.1675L173.98 1.69388H191.958L182.018 57.0944H164.506L166.874 45.1957C162.616 53.8278 155.523 58.7211 146.288 58.7211C135.403 58.7211 127.592 53.0013 127.592 41.6929C127.592 39.9482 127.832 38.1902 128.178 36.2093L134.325 1.69388H152.449Z" fill="black"/>
      <path d="M357.971 42.3469L354.866 57.0272H369.895L373 42.3469H357.971Z" fill="black"/>
    </svg>
  );
}

export function CustomLogoImage({
  className = '',
  url,
}: {
  url: string;
  className?: string;
}) {
  return (
    <img
      src={url}
      alt="Organization Logo"
      className={`object-contain ${className}`}
      onError={(e) => (e.currentTarget.src = '/path/to/default/logo.png')} // Replace with a valid path to a default logo
    />
  );
}

export function AppLogo({
  href = '/',
  label = 'Home Page',
  className = '',
  logoUrl,
}: {
  href?: string;
  className?: string;
  label?: string;
  logoUrl?: string;
}) {
  const { logo_url, logo_dark_url, sidebar_background_color } = useOrganizationSettings();
  const {theme} = getColorLuminance(sidebar_background_color?.length ? sidebar_background_color : '#f2f2f2');
  const themedLogoUrl = theme === 'dark' ? (logo_dark_url ?? logo_url): logo_url  

  logoUrl = logoUrl ?? themedLogoUrl;
  return (
    <Link
      aria-label={label}
      href={href}
      className={cn(`flex h-full max-h-[50px] w-[130px] items-center justify-start overflow-hidden`, className)}
    >
      {logoUrl ? (
        <CustomLogoImage url={logoUrl} className="h-full " />
      ) : (
        <LogoImage className="h-full w-full object-contain" />
      )}
    </Link>
  );
}
