'use client';

import { useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { useSignInWithEmailPassword } from '@kit/supabase/hooks/use-sign-in-with-email-password';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@kit/ui/form';

import { useCaptchaToken } from '../captcha/client';

import { 
  WhiteLabelClientSignUpSchema, 
  type WhiteLabelClientSignUpData 
} from '../schemas/white-label-client-sign-up.schema';
import { whiteLabelClientSignUp } from '../../.../../../team-accounts/src/server/actions/clients/white-label-signup/white-label-client-signup';

interface WhiteLabelClientSignUpFormProps {
  agencyId: string;
  themeColor?: string;
}

export function WhiteLabelClientSignUpForm({ 
  agencyId,
  themeColor 
}: WhiteLabelClientSignUpFormProps) {
  const { t } = useTranslation('auth');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const host = window.location.host; // Get the current host
  
  // Add sign in hooks
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();
  const signInMutation = useSignInWithEmailPassword();

  const form = useForm<WhiteLabelClientSignUpData>({
    resolver: zodResolver(WhiteLabelClientSignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      organizationName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback((data: WhiteLabelClientSignUpData) => {
    startTransition(async () => {
      setError(null);

      try {
        // Step 1: Register the client
        await whiteLabelClientSignUp(data, host, agencyId);
        
        // Step 2: Automatically sign in the user
        await signInMutation.mutateAsync({
          email: data.email,
          password: data.password,
          options: { captchaToken },
        });

        form.reset();
        
        // The redirect should happen automatically from the sign in process
      } catch (error) {
        console.error('Registration or sign in error:', error);
        setError(error instanceof Error ? error.message : t('whiteLabel.clientRegistration.errors.registrationFailed'));
      } finally {
        resetCaptchaToken();
      }
    });
  }, [host, agencyId, signInMutation, captchaToken, resetCaptchaToken, form, t]);

  return (
    <div className="space-y-6 w-full">
      <div className="text-center">
        <h3 className="text-lg font-medium">
          {t("whiteLabel.clientRegistration.title")}
        </h3>
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("whiteLabel.clientRegistration.name")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('whiteLabel.clientRegistration.namePlaceholder')}
                    disabled={isPending || signInMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("whiteLabel.clientRegistration.email")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('whiteLabel.clientRegistration.emailPlaceholder')}
                    disabled={isPending || signInMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("whiteLabel.clientRegistration.organizationName")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('whiteLabel.clientRegistration.organizationNamePlaceholder')}
                    disabled={isPending || signInMutation.isPending}
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
                  {t("whiteLabel.clientRegistration.password")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={t('whiteLabel.clientRegistration.passwordPlaceholder')}
                    disabled={isPending || signInMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("whiteLabel.clientRegistration.confirmPassword")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={t('whiteLabel.clientRegistration.confirmPasswordPlaceholder')}
                    disabled={isPending || signInMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || signInMutation.isPending}
            style={{
              backgroundColor: themeColor ?? undefined,
              borderColor: themeColor ?? undefined,
            }}
          >
            {(isPending || signInMutation.isPending)
              ? t("whiteLabel.clientRegistration.submitting")
              : t("whiteLabel.clientRegistration.submitButton")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
