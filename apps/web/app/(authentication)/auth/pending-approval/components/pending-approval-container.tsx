'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Clock, Mail, Users, ArrowLeft } from 'lucide-react';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';

export default function PendingApprovalContainer() {
  const { t } = useTranslation('auth');
  const signOut = useSignOut();

  const handleSignOut = async () => {
    await signOut.mutateAsync();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">
            {t('pendingApproval.title')}
          </CardTitle>
          <CardDescription>
            {t('pendingApproval.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-blue-900">
                    {t('pendingApproval.emailSent')}
                  </p>
                  <p className="text-sm text-blue-700">
                    {t('pendingApproval.emailSentDescription')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {t('pendingApproval.whatHappensNext')}
                  </p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• {t('pendingApproval.step1')}</li>
                    <li>• {t('pendingApproval.step2')}</li>
                    <li>• {t('pendingApproval.step3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('pendingApproval.signOut')}
            </Button>
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
