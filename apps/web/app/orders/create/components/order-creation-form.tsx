'use client';

import React, { useState } from 'react';



import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import ThemedButtonWithSettings from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import ThemedInputWithSettings from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import ThemedTextareaWithSettings from 'node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings';
import { createOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/create/create-order';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import UploadFileComponent from '~/components/ui/files-input';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// import { mapMimeTypeToFileType } from '../utils/map-mime-type';

const orderCreationFormSchema = z.object({
  uuid: z.string(),
  title: z
    .string()
    .min(2, { message: 'Title must be at least 2 characters.' })
    .max(200, {
      message: 'Title must be at most 200 characters.',
    }),
  description: z
    .string()
    .min(2, { message: 'Description must be at least 2 characters.' })
    .max(500, {
      message: 'Description must be at most 500 characters.',
    }),
  fileIds: z.array(z.string()),
});
const OrderCreationForm = () => {
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const uniqueId = generateUUID();
  const { t } = useTranslation('orders');
  // const supabase = useSupabase();
  const form = useForm<z.infer<typeof orderCreationFormSchema>>({
    resolver: zodResolver(orderCreationFormSchema),
    defaultValues: {
      uuid: uniqueId,
      title: '',
      description: '',
      fileIds: [],
    },
  });

  const createOrdersMutations = useMutation({
    mutationFn: async (values: z.infer<typeof orderCreationFormSchema>) => {
      await createOrders([
        {
          ...values,
          fileIds: uploadedFileIds,
          propietary_organization_id: '',
        },
      ]);
    },
    onError: () => {
      toast('Error', {
        description: 'There was an error creating the order.',
      });
    },
    onSuccess: () => {
      toast('Success', {
        description: 'The order has been created.',
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof orderCreationFormSchema>) => {
    createOrdersMutations.mutate(values);
  };

  const handleFileIdsChange = (fileIds: string[]) => {
    setUploadedFileIds(fileIds);
    form.setValue('fileIds', fileIds);
    // console.log('Uploaded File IDs:', fileIds);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('creation.form.titleLabel')}</FormLabel>
              <FormControl>
                <ThemedInputWithSettings
                  {...field}
                  placeholder={t('creation.form.titlePlaceholder')}
                  className="focus-visible:ring-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('creation.form.descriptionLabel')}</FormLabel>
              <FormControl>
                <ThemedTextareaWithSettings
                  {...field}
                  placeholder={t('creation.form.descriptionPlaceholder')}
                  rows={5}
                  className="focus-visible:ring-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <UploadFileComponent
          bucketName="orders"
          uuid={uniqueId}
          onFileIdsChange={handleFileIdsChange}
        />
        <ThemedButtonWithSettings type="submit" className="flex gap-2">
          <span>{t('creation.form.submitMessage')}</span>
          {createOrdersMutations.isPending && (
            <Spinner className="h-4 w-4 text-white" />
          )}
        </ThemedButtonWithSettings>
      </form>
    </Form>
  );
};

export default OrderCreationForm;