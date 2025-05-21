'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import { ThemedInput } from '../ui/input-themed-with-settings';


const AccountOrganizationNameSchem = z.object({
  name: z.string().min(2).max(100),
});
export function UpdateAccountOrganizationName() {
  const { updateOrganizationSetting, portal_name } = useOrganizationSettings();

  const form = useForm({
    resolver: zodResolver(AccountOrganizationNameSchem),
    defaultValues: {
      name: portal_name ?? '',
    },
  });

  const onSubmit = ({ name }: { name: string }) => {
    updateOrganizationSetting.mutate({
      key: 'portal_name',
      value: name,
    });
  };

  return (
    <div className={'flex flex-col w-full'}>
      <Form {...form}>
        <form
          data-test={'update-account-name-form'}
          className={'flex flex-col space-y-4'}
          onBlur={form.handleSubmit(onSubmit)}
        >
          <FormField
            name={'name'}
            render={({ field }) => (
              <FormItem>

                <FormControl>
                  <ThemedInput
                    data-test={'account-display-name'}
                    minLength={2}
                    placeholder={''}
                    maxLength={100}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

        </form>
      </Form>
    </div>
  );
}
