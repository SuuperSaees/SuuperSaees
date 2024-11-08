'use client';

import React from 'react';

import { Button } from '@kit/ui/button';
import { useTranslation } from 'react-i18next';

const DetailsSide = () => {
  const { t } = useTranslation('services');
  return (
    <Button
      onClick={() => {
        window.location.href = '/auth/sign-in';
      }}
    >
      {t('checkout.success.sign_in')}
    </Button>
  );
};

export default DetailsSide;
