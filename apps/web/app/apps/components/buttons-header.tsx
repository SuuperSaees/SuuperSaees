'use client';

import { Button } from "@kit/ui/button";
import { ArrowLeft } from "lucide-react";

import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

function ButtonsHeader() {
  const { t } = useTranslation('plugins');
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" className="gap-2" onClick={() => router.push('/apps')}>
        <ArrowLeft className="h-4 w-4" />
        {t('goBack')}
      </Button>
      <ThemedButton>{t('save')}</ThemedButton>
    </div>
  );
}

export default ButtonsHeader;
