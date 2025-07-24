'use client';

import { useTranslation } from 'react-i18next';
import { WhiteLabelClientSignUpForm } from './white-label-client-sign-up-form';

interface WhiteLabelSignUpTabsProps {
  authDetails?: {
    theme_color?: string;
    background_color?: string;
  } | null;
  organizationId: string;
}

export function WhiteLabelSignUpTabs({ 
  authDetails,
  organizationId
}: WhiteLabelSignUpTabsProps) {
    const { t } = useTranslation('auth');

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-5xl font-semibold mb-2">
          {t('signUp.title')}
        </h2>
      </div>

          <WhiteLabelClientSignUpForm 
            agencyId={organizationId}
            themeColor={authDetails?.theme_color}
          />
    </div>
  );
}
