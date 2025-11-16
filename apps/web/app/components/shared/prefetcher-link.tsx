'use client';

import { ComponentPropsWithRef, forwardRef } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PrefetcherLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithRef<typeof Link>
>((props, ref) => {
  const router = useRouter();
  const strHref = typeof props.href === 'string' ? props.href : props.href.href;

  const conditionalPrefetch = () => {
    if (strHref) {
      void router.prefetch(strHref);
    }
  };

  return (
    <Link
      {...props}
      ref={ref}
      prefetch={true}
      onMouseEnter={(e) => {
        conditionalPrefetch();
        return props.onMouseEnter?.(e);
      }}
      onPointerEnter={(e) => {
        conditionalPrefetch();
        return props.onPointerEnter?.(e);
      }}
      onTouchStart={(e) => {
        conditionalPrefetch();
        return props.onTouchStart?.(e);
      }}
      onFocus={(e) => {
        conditionalPrefetch();
        return props.onFocus?.(e);
      }}
    />
  );
});

PrefetcherLink.displayName = 'PrefetcherLink';

export default PrefetcherLink;
