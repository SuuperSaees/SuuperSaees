import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { ThemedInput } from '../ui/input-themed-with-settings';
import { useUpdateDomain } from '../../hooks/use-update-domain';

const AccountOrganizationDomainSchema = z.object({
  domain: z
    .string()
    .min(2, 'Domain is too short')
    .max(100, 'Domain is too long')
    .regex(
      /^(localhost(:\d{1,5})?|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/,
      'Please enter a valid domain format (e.g., domain.com, app.domain.co, localhost:3000)'
    ),
});

export function UpdateAccountOrganizationDomain({ organizationId }: { organizationId: string }) {
  const { domain, updateDomain, isLoading } = useUpdateDomain(organizationId);
  const form = useForm({
    resolver: zodResolver(AccountOrganizationDomainSchema),
    defaultValues: {
      domain: domain ?? '',
    },
  });

  useEffect(() => {
    if (domain) {
      form.setValue('domain', domain);
    }
  }, [domain, form]);

  const onSubmit = ({ domain }: { domain: string }) => {
  updateDomain({ domain });
  };

  return (
    <div className={'flex flex-col w-full'}>
      <Form {...form}>
        <form
          data-test={'update-account-domain-form'}
          className={'flex flex-col space-y-4'}
          onBlur={form.handleSubmit(onSubmit)}
        >
          <FormField
            name={'domain'}
            render={({ field }) => (
              <FormItem>

                <FormControl>
                  <ThemedInput
                    data-test={'account-domain'}
                    minLength={2}
                    disabled={isLoading}
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

