'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Info } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('client');
    const { t } = useTranslation('auth');

  return (
    <div className="w-full h-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t('whiteLabel.registerAs')}
        </h2>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger 
            value="agency-member"
            className="text-sm"
          >
            {t('whiteLabel.agencyMember')}
          </TabsTrigger>
          <TabsTrigger 
            value="client"
            className="text-sm"
          >
            {t('whiteLabel.client')}
          </TabsTrigger>
        </TabsList>

        {/* Agency Member Tab */}
        <TabsContent value="agency-member" className="space-y-4 w-96">
          <Alert className='w-full'>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-center">
              <div className="font-medium mb-1">
                {t('whiteLabel.comingSoon')}
              </div>
              <div className="text-sm opacity-80">
                {t('whiteLabel.agencyMemberComingSoon')}
              </div>
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Client Tab */}
        <TabsContent value="client" className="space-y-4 w-96">
          <WhiteLabelClientSignUpForm 
            agencyId={organizationId}
            themeColor={authDetails?.theme_color}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
