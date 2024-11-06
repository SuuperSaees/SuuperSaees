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
import { Trans } from '@kit/ui/trans';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import { ThemedButton } from '../ui/button-themed-with-settings';
import { ThemedInput } from '../ui/input-themed-with-settings';

const AccountOrganizationSenderNameSchema = z.object({
  sender_name: z.string().min(2).max(100),
});
export function UpdateAccountOrganizationSenderName() {
  const { updateOrganizationSetting, sender_name } = useOrganizationSettings();

  const form = useForm({
    resolver: zodResolver(AccountOrganizationSenderNameSchema),
    defaultValues: {
      sender_name: sender_name ?? '',
    },
  });

  const onSubmit = ({ sender_name }: { sender_name: string }) => {
    updateOrganizationSetting.mutate({
      key: 'sender_name',
      value: sender_name,
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
            name={'sender_name'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'account:brandSenderName'} />
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
                updateOrganizationSetting.variables.key === 'sender_name'
              }
            >
              <Trans i18nKey={'account:brandSenderNameSubmit'} />
            </ThemedButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
