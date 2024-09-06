'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';



import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Spinner } from '@kit/ui/spinner';



import { useOrganizationSettings } from '../../context/organization-settings-context';
import { ThemedButton } from '../ui/button-themed-with-settings';


// import ThemedButtonWithSettings from '../ui/button-themed-with-settings';

// import type { Database } from '../../../../../../apps/web/lib/database.types'
const KeyEnum = z.enum(['theme_color']);

const colorBrandSchema = z.object({
  key: KeyEnum,
  value: z.string(),
});

export default function UpdateAccountColorBrand() {
  const { t } = useTranslation();
  const { brandThemeColor, updateBrandColorTheme } = useOrganizationSettings();
  console.log('brandThemeColor', brandThemeColor);
  const form = useForm<z.infer<typeof colorBrandSchema>>({
    resolver: zodResolver(colorBrandSchema),
    defaultValues: {
      key: 'theme_color',
      value: brandThemeColor ?? '#2B47DA',
    },
  });

  const onSubmit = (values: z.infer<typeof colorBrandSchema>) => {
    updateBrandColorTheme.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="w-fit">
              <FormLabel>{t('account:brandColorSelectLabel')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Color Brand"
                  {...field}
                  type="color"
                  className="max-w-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ThemedButton
          className={`bg-brand flex gap-2`}

        >
          <span>{t('account:brandColorSubmit')}</span>
          {updateBrandColorTheme.isPending && (
            <Spinner className="h-4 w-4 text-white" />
          )}
        </ThemedButton>
      </form>
    </Form>
  );
}