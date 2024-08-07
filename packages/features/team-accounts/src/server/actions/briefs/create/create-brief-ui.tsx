'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
import { Separator } from '@kit/ui/separator';

import { createBrief } from './create-briefs';

const formSchema = z.object({
  name: z.string().min(2).max(50),
});

type CreateBriefDialogProps = {
  propietary_organization_id: string;
};

const CreateBriefDialog = ({
  propietary_organization_id,
}: CreateBriefDialogProps) => {
  const { t } = useTranslation('briefs');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await createBrief({
      ...values,
      propietary_organization_id,
    });
    window.location.reload();
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>{t('createBrief')}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="flex w-full items-center justify-between">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('createBrief')}</AlertDialogTitle>
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
                      <FormLabel>{t('briefName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('briefNameLabel')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('servicePrice')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('servicepriceLabel')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <Separator />
                <Button type="submit" className="w-full">
                  {t('createBrief')}
                </Button>
              </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreateBriefDialog;
