import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
// import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import { ThemedButton } from '../ui/button-themed-with-settings';
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
    <div className={'flex flex-col space-y-8'}>
      <Form {...form}>
        <form
          data-test={'update-account-name-form'}
          className={'flex flex-col space-y-4'}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name={'name'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'account:brandName'} />
                </FormLabel>

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

          <div>
            <ThemedButton
              disabled={
                updateOrganizationSetting.isPending &&
                updateOrganizationSetting.variables.key === 'portal_name'
              }
            >
              <Trans i18nKey={'account:brandNameSubmit'} />
            </ThemedButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
