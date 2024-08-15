'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/create/create-order';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import UploadFileComponent from '~/components/ui/files-input';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


// import { mapMimeTypeToFileType } from '../utils/map-mime-type';

const orderCreationFormSchema = z.object({
  id: z.string(),
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
  // files: z.array(
  //   z.object({
  //     name: z.string(),
  //     size: z.number(),
  //     type: z.enum(['image', 'pdf', 'video', 'fig']),
  //     url: z.string(),
  //   }),
  // ),
});
const OrderCreationForm = () => {
  const uniqueId = generateUUID();
  const { t } = useTranslation('orders');
  // const supabase = useSupabase();
  const form = useForm<z.infer<typeof orderCreationFormSchema>>({
    resolver: zodResolver(orderCreationFormSchema),
    defaultValues: {
      id: uniqueId,
      title: '',
      description: '',
      // files: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof orderCreationFormSchema>) => {
    try {
      const result = await createOrders([values]);
      console.log('submit', result);
    } catch (error) {
      console.log(error);
    }
  };



  // const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) {
  //     console.error('Please select a file to be uploaded');
  //   } else {
  //     const fileExt = Date.now() + '_' + file.name;
  //     const filePath = 'images/' + fileExt;
  //     console.log('file path', filePath, file);

  //     const { data: imageData, error: imageError } = await supabase.storage
  //       .from('orders')
  //       .upload(filePath, file);

  //     if (imageError) {
  //       console.error('Error uploading file', imageError);
  //     } else {
  //       console.log('File uploaded successfully', imageData);
  //       const {
  //         data: { publicUrl },
  //       } = supabase.storage.from('orders').getPublicUrl(filePath);

  //       const newFileData = {
  //         name: file.name,
  //         size: file.size,
  //         type: mapMimeTypeToFileType(file.type),
  //         url: publicUrl,
  //       };
  //       form.setValue('files', [...form.getValues().files, newFileData]);
  //     }
  //   }
  // };

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
        {/* <FormField
          control={form.control}
          name="files"
          render={() => (
            <FormItem>
              <FormLabel>{t('creation.form.filesLabel')}</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  placeholder="creation.form.filesPlaceholder"
                  onChange={uploadFile}
                  accept="image/*"
                />
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <UploadFileComponent bucketName='orders' id={uniqueId} />
        <Button type="submit">{t('creation.form.submitMessage')}</Button>
      </form>
    </Form>
  );
};

export default OrderCreationForm;