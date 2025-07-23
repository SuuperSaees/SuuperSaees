'use client';

import { useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@kit/ui/form';

import { 
  WhiteLabelAgencyMemberSignUpSchema, 
  type WhiteLabelAgencyMemberSignUpData 
} from '../schemas/white-label-agency-member-sign-up.schema';
import { whiteLabelAgencyMemberSignUp } from '../../../../features/team-accounts/src/server/actions/agency-members/white-label-signup/white-label-agency-member-signup'

interface WhiteLabelAgencyMemberSignUpFormProps {
  agencyId: string;
  themeColor?: string;
}

export function WhiteLabelAgencyMemberSignUpForm({ 
  agencyId,
  themeColor 
}: WhiteLabelAgencyMemberSignUpFormProps) {
  const { t } = useTranslation('auth');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const host = window.location.host;
  const router = useRouter();

  const form = useForm<WhiteLabelAgencyMemberSignUpData>({
    resolver: zodResolver(WhiteLabelAgencyMemberSignUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback((data: WhiteLabelAgencyMemberSignUpData) => {
    startTransition(async () => {
      setError(null);
      setSuccess(false);

      try {
        await whiteLabelAgencyMemberSignUp(data, host, agencyId).catch((error) => {
          throw error;
        });
        
        form.reset();
        setSuccess(true);
        
        // Redirect to sign in after success
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 3000);
        
      } catch (error) {
        console.error('Agency member registration error:', error);
        setError(error instanceof Error ? error.message : t('whiteLabel.agencyMemberRegistration.errors.registrationFailed'));
      }
    });
  }, [host, agencyId, form, t, router]);

  if (success) {
    return (
      <div className="space-y-6 w-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-green-600 mb-4">
            {t("whiteLabel.agencyMemberRegistration.success.title")}
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("whiteLabel.agencyMemberRegistration.success.description")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("whiteLabel.agencyMemberRegistration.success.emailSent")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("whiteLabel.agencyMemberRegistration.success.redirecting")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="text-center">
        <h3 className="text-lg font-medium">
          {t("whiteLabel.agencyMemberRegistration.title")}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t("whiteLabel.agencyMemberRegistration.description")}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("whiteLabel.agencyMemberRegistration.email")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('whiteLabel.agencyMemberRegistration.emailPlaceholder')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("whiteLabel.agencyMemberRegistration.password")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={t('whiteLabel.agencyMemberRegistration.passwordPlaceholder')}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            style={{
              backgroundColor: themeColor ?? undefined,
              borderColor: themeColor ?? undefined,
            }}
          >
            {isPending
              ? t("whiteLabel.agencyMemberRegistration.submitting")
              : t("whiteLabel.agencyMemberRegistration.submitButton")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
