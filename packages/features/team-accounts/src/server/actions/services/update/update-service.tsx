'use client';

import React, { useState } from 'react';



import { zodResolver } from '@hookform/resolvers/zod';
import { Pen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';



import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Separator } from '@kit/ui/separator';



import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { ThemedButton } from '../../../../../../accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from '../../../../../../accounts/src/components/ui/input-themed-with-settings';
import { updateService } from './update-service-server';


const formSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  name: z.string().min(2).max(50),
  price: z.number().min(2).max(15),
  number_of_clients: z.number(),
  status: z.string().min(2).max(20),
  propietary_organization_id: z.string(),
});

type UpdateServiceProps = {
  id: number;
  values: Service.Update;
};

const UpdateServiceDialog = ({ id, values }: UpdateServiceProps) => {
  const { t } = useTranslation('services');
  const [selectedStatus, setSelectedStatus] = useState(status);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: values,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateService(id, values);
    window.location.reload();
  }

  const handleRoleSelect = (status: string) => {
    setSelectedStatus(status);
    form.setValue('status', status);
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Pen className="h-4 w-4 cursor-pointer text-gray-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex w-full items-center justify-between">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('updateService')}</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogCancel className="font-bold text-red-500 hover:text-red-700">
              X
            </AlertDialogCancel>
          </div>
          <AlertDialogDescription>
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
                      <FormLabel>{t('serviceName')}</FormLabel>
                      <FormControl>
                        <ThemedInput placeholder={t('serviceNameLabel')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('servicePrice')}</FormLabel>
                      <FormControl>
                        <ThemedInput
                          placeholder={t('servicepriceLabel')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('statusSelection')}</FormLabel>
                      <FormControl>
                        <Input
                          className="hidden"
                          {...field}
                          value={selectedStatus}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {selectedStatus ? t(selectedStatus) : t('status')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>
                      {t('statusSelection')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => handleRoleSelect('active')}
                      >
                        {t('active')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleSelect('draft')}
                      >
                        {t('draft')}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Separator />
                <ThemedButton
                  type="submit"
                  className="w-full"
                  onClick={() => console.log('Submit button clicked')}
                >
                  {t('updateService')}
                </ThemedButton>
              </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpdateServiceDialog;