'use client';

import { useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

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
  agencyName: string;
  themeColor?: string;
}

export function WhiteLabelClientSignUpForm({ 
  agencyId,
  agencyName,
  themeColor 
}: WhiteLabelClientSignUpFormProps) {
  const { t } = useTranslation('auth');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const host = window.location.host; // Get the current host
  const router = useRouter();
  
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
        await whiteLabelClientSignUp(data, host, agencyId, agencyName);
        
        // Step 2: Automatically sign in the user
        await signInMutation.mutateAsync({
          email: data.email,
          password: data.password,
          options: { captchaToken },
        });

        form.reset();

        // Redirect to home page after successful sign up and sign in
        router.push('/orders');
        
        // The redirect should happen automatically from the sign in process
      } catch (error) {
        console.error('Registration or sign in error:', error);
        setError(error instanceof Error ? error.message : t('whiteLabel.clientRegistration.errors.registrationFailed'));
      } finally {
        resetCaptchaToken();
      }
    });
  }, [host, agencyId, signInMutation, captchaToken, resetCaptchaToken, form, t, router]);

  return (
    <div className="space-y-6 w-full text-start">
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
                    className="h-fit py-3 placeholder:text-inherit"
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
                    className="h-fit py-3 placeholder:text-inherit"
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
                    className="h-fit py-3 placeholder:text-inherit"
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
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('whiteLabel.clientRegistration.passwordPlaceholder')}
                      disabled={isPending || signInMutation.isPending}
                      className="h-fit py-3 pr-10 placeholder:text-inherit"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('whiteLabel.clientRegistration.confirmPasswordPlaceholder')}
                      disabled={isPending || signInMutation.isPending}
                      className="h-fit py-3 pr-10 placeholder:text-inherit"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-fit py-3"
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
