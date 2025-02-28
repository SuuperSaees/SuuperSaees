'use client';

import { useTranslation } from 'react-i18next';

interface EmptyPaymentMethodsProps {
  logoUrl: string;
}

export default function EmptyPaymentMethods({ logoUrl }: EmptyPaymentMethodsProps) {
    const { t } = useTranslation();
  
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8 text-center">
        <img
          src={logoUrl}
          alt="Company logo"
          className="mb-8 h-20 w-auto animate-fade-in"
        />
        
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('billing:noPaymentMethodsTitle', 'No Payment Methods Available')}
          </h1>
          
          <p className="text-lg text-gray-600">
            {t('billing:noPaymentMethodsDescription', 
              'Please contact support to set up your payment methods and continue with the checkout process.')}
          </p>
        </div>
      </div>
    );
  }