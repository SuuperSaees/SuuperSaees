'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pen } from 'lucide-react';
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

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { updateBrief } from './update-brief';

const formSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string().min(2).max(50),
  propietary_organization_id: z.string().nullable(),
});

const UpdateBriefDialog = ({
  id,
  created_at,
  name,
  propietary_organization_id,
}: Brief.Type) => {
  const { t } = useTranslation('briefs');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id,
      created_at: created_at,
      name: name,
      propietary_organization_id: propietary_organization_id,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log('onSubmit called'); // Asegúrate de que esta línea se imprima
    // console.log('Submitted values:', values); // Verifica los valores aquí

    await updateBrief(values);
    window.location.reload();
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Pen className="h-4 w-4 cursor-pointer text-gray-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex w-full items-center justify-between">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('updateBrief')}</AlertDialogTitle>
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

                <Separator />
                <Button
                  type="submit"
                  className="w-full"
                  // onClick={() => console.log('Submit button clicked')}
                >
                  {t('updateBrief')}
                </Button>
              </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpdateBriefDialog;
