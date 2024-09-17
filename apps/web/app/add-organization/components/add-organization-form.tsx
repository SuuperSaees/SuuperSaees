'use client';

import React, { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';

import { createOrganizationServer } from '../../../../../packages/features/team-accounts/src/server/actions/organizations/create/create-organization-server';
import { createSubscription } from '../../../../../packages/features/team-accounts/src/server/actions/subscriptions/create/create-subscription'

const formSchema = z.object({
  organization_name: z.string().min(2).max(50),
});

const CreateOrganization = () => {
  const { t } = useTranslation('organizations');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization_name: '',
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createOrganizationServer({
        ...values,
      });
      setIsDialogOpen(true);
      toast.success('Success', {
        description: 'Organization created successfully',
      });
      await createSubscription()
    } catch (error) {
      toast.error('Error', {
        description: 'Error creating organization',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8">
        <div className="mb-8 flex items-center justify-center">
          <Button variant="outline" className="pointer-events-none">
            <KeyRound size={24} />
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organization_name"
              render={({ field }) => (
                <FormItem className="mb-[24px] flex flex-col items-center justify-center">
                  <FormLabel className="font-inter mb-[32px] text-center text-3xl font-semibold leading-[38px] text-gray-900">
                    {t('organizationName')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('organizationLabel')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {t('continue')}
            </Button>
          </form>
        </Form>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('successAgency')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('successAgencyDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Link href="/orders">
                <AlertDialogAction>{t('continue')}</AlertDialogAction>
              </Link>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CreateOrganization;