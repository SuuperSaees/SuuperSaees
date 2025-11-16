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
import { ThemedInput } from '../ui/input-themed-with-settings';

const AccountOrganizationSenderEmailAndSenderDomainSchema = z.object({
  sender_email: z
    .string()
    .transform((email) => email.toLowerCase())
    .refine((email) => {
      const testEmail = `${email}@gmail.com`; // Add suffix to validate
      return z.string().email().safeParse(testEmail).success;
    })
    .optional(),
  sender_domain: z
    .string()
    .refine((domain) => {
      const testDomain = `test@${domain}`; // Add prefix to validate
      return z.string().email().safeParse(testDomain).success;
    })
    .optional(),
});
export function UpdateAccountOrganizationSenderEmailAndSenderDomain() {
  const { updateOrganizationSetting, sender_email, sender_domain } = useOrganizationSettings();
  const currentHost = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  const shouldShowDomainSelect = !(
    currentHost === new URL(process.env.NEXT_PUBLIC_SITE_URL ?? '').hostname || currentHost.includes('suuper.co') || currentHost.includes('localhost')
  );
  const form = useForm({
    resolver: zodResolver(AccountOrganizationSenderEmailAndSenderDomainSchema),
    defaultValues: {
      sender_email: sender_email ?? '',
      sender_domain: sender_domain ?? '',
    },
  });

  const onSubmit = ({ sender_email, sender_domain }: { sender_email?: string; sender_domain?: string }) => {

    if (sender_email) {
      updateOrganizationSetting.mutate({
        key: 'sender_email',
        value: sender_email.toLowerCase(),
      });
    }
    if (sender_domain) {
      updateOrganizationSetting.mutate({
        key: 'sender_domain',
        value: sender_domain,
      });
    }
  };

  return (
    <div className={'flex flex-col w-full'}>
      <Form {...form}>
        <form
          data-test={'update-account-sender-email-and-sender-domain-form'}
          className={'flex flex-col space-y-4'}
          onBlur={form.handleSubmit((e) => onSubmit({sender_email: e.sender_email}))}
        >
          <FormField
            name={'sender_email'}
            render={({ field }) => (
              <FormItem>

                <div className={'flex items-center gap-2'}>
                <FormControl>
                  <ThemedInput
                    data-test={'account-sender-email'}
                    minLength={2}
                    placeholder={''}
                    maxLength={100}
                    {...field}
                  />
                </FormControl>
                  <span className={'text-sm text-gray-500'}>@{sender_domain}</span>
                </div>

                <FormMessage />
              </FormItem>

            )}
          />

          {shouldShowDomainSelect && (
            <FormField
              name={'sender_domain'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey={'account:brandSenderDomainSubmit'} />
                  </FormLabel>

                  <FormControl>
                    <select
                      data-test={'account-sender-domain'}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        field.onChange(onSubmit({ sender_domain: value }));
                      }}
                      value={sender_domain}
                    >
                      <option value={currentHost}>{currentHost}</option>
                      <option value={'suuper.co'}>suuper.co</option>
                    </select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
