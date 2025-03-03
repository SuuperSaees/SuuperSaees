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

import { ThemedInput } from '../ui/input-themed-with-settings';
import { useUpdateDomain } from '../../hooks/use-update-domain';

const AccountOrganizationDomainSchema = z.object({
    domain: z.string().min(2).max(100),
  });

export function UpdateAccountOrganizationDomain({ organizationId }: { organizationId: string }) {
  const { domain, updateDomain, isLoading } = useUpdateDomain(organizationId);

  const form = useForm({
    resolver: zodResolver(AccountOrganizationDomainSchema),
    defaultValues: {
      domain: domain ?? '',
    },
  });

  const onSubmit = ({ domain }: { domain: string }) => {
    updateDomain({ domain });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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

