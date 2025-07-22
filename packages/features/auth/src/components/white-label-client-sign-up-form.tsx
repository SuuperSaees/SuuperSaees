'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

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

  const onSubmit = (data: WhiteLabelClientSignUpData) => {
    startTransition(() => {
      setError(null);

      whiteLabelClientSignUp(data, host, agencyId)
        .then(() => {
          // The server action will handle the redirect
          form.reset();
        })
        .catch((error) => {
          console.error('Registration error:', error);
          setError(error instanceof Error ? error.message : t('whiteLabel.clientRegistration.errors.registrationFailed'));
        });
    });
  };

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
                    disabled={isPending}
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
                    disabled={isPending}
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
                  {t("whiteLabel.clientRegistration.password")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={t('whiteLabel.clientRegistration.passwordPlaceholder')}
                    disabled={isPending}
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
              ? t("whiteLabel.clientRegistration.submitting")
              : t("whiteLabel.clientRegistration.submitButton")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
