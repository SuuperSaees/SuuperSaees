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
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Spinner } from '@kit/ui/spinner';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import { ThemedButton } from '../ui/button-themed-with-settings';

const KeyEnum = z.enum(['theme_color']);

const colorBrandSchema = z.object({
  key: KeyEnum,
  value: z.string(),
});

export default function UpdateAccountColorBrand() {
  const { t } = useTranslation();
  const { theme_color, updateOrganizationSetting, resetOrganizationSetting } =
    useOrganizationSettings();

  const form = useForm<z.infer<typeof colorBrandSchema>>({
    resolver: zodResolver(colorBrandSchema),
    defaultValues: {
      key: 'theme_color',
      value: theme_color ?? '#2B47DA',
    },
  });

  const onSubmit = (values: z.infer<typeof colorBrandSchema>) => {
    updateOrganizationSetting.mutate(values);
  };

  const onReset = () => {
    resetOrganizationSetting('theme_color');
    form.reset({ key: 'theme_color', value: '#2B47DA' }); // Reset the form to the default color or your desired value
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex gap-5">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="w-fit mb-3">
              <FormControl>
                <Input
                  placeholder="Color Brand"
                  {...field}
                  type="color"
                  className="w-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 w-full justify-between">
          <ThemedButton type="submit" className={`bg-brand flex gap-2 w-[80%]`}>
            <span>{t('account:brandColorSubmit')}</span>
            {updateOrganizationSetting.isPending &&
              updateOrganizationSetting.variables?.key === 'theme_color' && (
                <Spinner className="h-4 w-4 text-white" />
              )}
          </ThemedButton>
          <Button
            variant={'ghost'}
            type="button"
            onClick={onReset}
            className="flex gap-2 w-[20%] bg-gray-200"
          >
            <span>{t('account:brandColorReset')}</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}