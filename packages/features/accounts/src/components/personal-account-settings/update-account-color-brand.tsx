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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex gap-5 items-center justify-between">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="w-fit">
              <FormControl>
                <div className="relative w-20 h-20 rounded-full overflow-hidden border">
                  <Input
                    {...field}
                    type="color"
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                  />
                  <div
                    style={{ backgroundColor: field.value }}
                    className="w-full h-full"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 w-full justify-end">
          <Button variant='static' className={`bg-none flex p-0`}>
            <span className='text-blue-600'>{t('account:brandColorSubmit')}</span>
            {/* {updateOrganizationSetting.isPending &&
              updateOrganizationSetting.variables?.key === 'theme_color' && (
                <Spinner className="h-4 w-4 text-white" />
              )} */}
          </Button>
          <Button
            variant='static'
            type="button"
            onClick={onReset}
            className="flex p-0 bg-none"
          >
            <span className='text-gray-600'>{t('account:brandColorReset')}</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}