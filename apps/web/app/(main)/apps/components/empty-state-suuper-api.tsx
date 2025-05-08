'use client';

import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/ui/empty-state';

export default function EmptyStateSuuperApi() {
  const { t } = useTranslation('plugins');
 
  return (
    <EmptyState
      title={t('noApiKeys')}
      description={t('noApiKeysDescription')}
      imageSrc="/images/illustrations/Illustration-box.svg"
      className="h-full"
    />
  );
}

