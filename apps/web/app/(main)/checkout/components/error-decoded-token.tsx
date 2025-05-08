'use client';

import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useRouter } from 'next/navigation';

export default function ErrorDecodedToken() {
    const { t } = useTranslation();
    const router = useRouter();

    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6 flex flex-col items-center">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800">
            {t('billing:invalidCheckoutUrl', 'Invalid Checkout URL')}
          </h1>
          
          <p className="text-lg text-gray-600">
            {t('billing:invalidCheckoutUrlDescription', 
              'There was an error processing your checkout URL. Please try again or contact support if the problem persists.')}
          </p>

          <ThemedButton 
            onClick={() => router.push('/')}
            className="mt-4"
          >
            {t('common:backToHome', 'Back to Home')}
          </ThemedButton>
        </div>
      </div>
    );
  }