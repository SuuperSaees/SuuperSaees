'use client';

import React from 'react';

import { Button } from '@kit/ui/button';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const DetailsSide = () => {
  const { t } = useTranslation('services');
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        router.push('/auth/sign-in');
      }}
    >
      {t('checkout.success.sign_in')}
    </Button>
  );
};

export default DetailsSide;
