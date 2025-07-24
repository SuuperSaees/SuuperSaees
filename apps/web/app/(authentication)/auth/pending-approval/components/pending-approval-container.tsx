'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Clock, Mail, Users, ArrowLeft } from 'lucide-react';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useAuthDetails } from '@kit/auth/sign-in';

export default function PendingApprovalContainer({ host }: { host: string }) {
  const { t } = useTranslation('auth');
  const signOut = useSignOut();
  const { authDetails } = useAuthDetails(host)
  const themeColor = authDetails?.theme_color;

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
            <Alert variant="info">
              <Mail className="h-4 w-4" />
              <AlertTitle>{t('pendingApproval.emailSent')}</AlertTitle>
              <AlertDescription>
                {t('pendingApproval.emailSentDescription')}
              </AlertDescription>
            </Alert>

            <Alert variant="default">
              <Users className="h-4 w-4" />
              <AlertTitle>{t('pendingApproval.whatHappensNext')}</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• {t('pendingApproval.step1')}</li>
                  <li>• {t('pendingApproval.step2')}</li>
                  <li>• {t('pendingApproval.step3')}</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
              style={{
              backgroundColor: themeColor ?? undefined,
              borderColor: themeColor ?? undefined,
            }}
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
