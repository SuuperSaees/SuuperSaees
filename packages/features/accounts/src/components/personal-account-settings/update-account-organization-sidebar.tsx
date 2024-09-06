'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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
import { Spinner } from '@kit/ui/spinner';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import { ThemedButton } from '../ui/button-themed-with-settings';

// import type { Database } from '../../../../../../apps/web/lib/database.types'
const KeyEnum = z.enum(['sidebar_background_color']);

const colorBrandSchema = z.object({
  key: KeyEnum,
  value: z.string(),
});

export default function UpdateAccountOrganizationSidebar() {
  const { t } = useTranslation();
  const {
    sidebar_background_color,
    updateOrganizationSetting,
    resetOrganizationSetting,
  } = useOrganizationSettings();
  // console.log('sidebar_background_color', sidebar_background_color);
  const form = useForm<z.infer<typeof colorBrandSchema>>({
    resolver: zodResolver(colorBrandSchema),
    defaultValues: {
      key: 'sidebar_background_color',
      value: sidebar_background_color ?? '#ffffff',
    },
  });

  const onSubmit = (values: z.infer<typeof colorBrandSchema>) => {
    updateOrganizationSetting.mutate(values);
  };
  const onReset = () => {
    resetOrganizationSetting('sidebar_background_color');
    form.reset({ key: 'sidebar_background_color', value: '#ffffff' }); // Reset the form to the default color or your desired value
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="w-fit">
              <FormLabel>{t('account:brandSidebarLabel')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Sidebar Color"
                  {...field}
                  type="color"
                  className="max-w-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <ThemedButton className={`bg-brand flex gap-2`}>
            <span>{t('account:brandSidebarSubmit')}</span>
            {updateOrganizationSetting.isPending &&
              updateOrganizationSetting.variables.key ===
                'sidebar_background_color' && (
                <Spinner className="h-4 w-4 text-white" />
              )}
          </ThemedButton>
          <Button
            variant={'ghost'}
            type="button"
            onClick={onReset}
            className="flex gap-2"
          >
            <span>{t('account:brandColorReset')}</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}
