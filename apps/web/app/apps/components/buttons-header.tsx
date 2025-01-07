'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';

function ButtonsHeader() {
  const { t } = useTranslation('plugins');
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => router.push('/apps')}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('goBack')}
      </Button>
    </div>
  );
}

export default ButtonsHeader;
