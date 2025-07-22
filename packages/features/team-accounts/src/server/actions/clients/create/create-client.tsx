'use client';

import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Separator } from '@kit/ui/separator';

import { handleResponse } from '../../../../../../../../apps/web/lib/response/handle-response';
import { ThemedButton } from '../../../../../../accounts/src/components/ui/button-themed-with-settings';
import { createClient } from './create-clients';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  email: z.string().email(),
  role: z.string().min(2).max(50),
});

interface CreateClientDialogProps {
  customTrigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

const CreateClientDialog = ({
  customTrigger,
  onOpenChange,
  open,
}: CreateClientDialogProps) => {
  const { t } = useTranslation('responses');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'client_owner',
    },
  });

  let host = 'localhost:3000';
  host =
    typeof window !== 'undefined' ? window.location.host : 'localhost:3000';

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newClient = { ...values };
    const res = await createClient({
      client: newClient,
      role: values.role,
      adminActivated: false,
      baseUrl: `${host === 'localhost:3000' ? 'http://' : 'https://'}${host}`,
    });
    await handleResponse(res, 'clients', t).catch(() => null);
    window.location.reload();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => onOpenChange?.(newOpen)}>
        <DialogTrigger asChild>
          {customTrigger ?? (
            <ThemedButton aria-label={t('createClient')}>
              <PlusIcon className="h-4 w-4" />
              <span className="hidden md:inline">
                {t('createClient')}
              </span>
            </ThemedButton>
          )}
        </DialogTrigger>
        <DialogContent>
          <div className="flex w-full items-center justify-between">
            <DialogTitle>{t('clients:creation.title')}</DialogTitle>
          </div>
          <div className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('nameLabel')} {...field} />
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
                      <FormLabel>{t('clientEmail')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('emailLabel')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('organizationName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('organizationLabelInput')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />
                <ThemedButton type="submit" className="w-full">
                  {t('clients:creation.form.submitMessage')}
                </ThemedButton>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateClientDialog;
