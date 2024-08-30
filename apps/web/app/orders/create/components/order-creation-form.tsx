'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { createOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/create/create-order';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
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
import { Textarea } from '@kit/ui/textarea';

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
  console.log('uniqueId', uniqueId);
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

  const onSubmit = async (values: z.infer<typeof orderCreationFormSchema>) => {
    try {
      const result = await createOrders([
        { ...values, fileIds: uploadedFileIds, propietary_organization_id: '' },
      ]);
      console.log('submit', result);
    } catch (error) {
      toast('Error', {
        description: 'There was an error creating the order.',
      });
    }
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
                <Input
                  {...field}
                  placeholder={t('creation.form.titlePlaceholder')}
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
                <Textarea
                  {...field}
                  placeholder={t('creation.form.descriptionPlaceholder')}
                  rows={5}
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
        <Button type="submit">{t('creation.form.submitMessage')}</Button>
      </form>
    </Form>
  );
};

export default OrderCreationForm;