// Dialog to create a new chat
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import { SquarePen } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Separator } from '@kit/ui/separator';

import { Account } from '~/lib/account.types';
import { Chats } from '~/lib/chats.types';
import { User } from '~/lib/user.types';
import {
  getClientMembersForOrganization,
  getClientsOrganizations,
} from '~/team-accounts/src/server/actions/clients/get/get-clients';

import OrganizationMemberAssignation from '../../components/users/organization-members-assignations';

// Dialog to create a new chat

// Dialog to create a new chat

const formSchema = z.object({
  name: z.string().min(1),
  agencyMembers: z.array(z.string()).refine((data) => data.length > 0, {
    message: 'At least one agency member is required',
  }),
  clientMembers: z.array(z.string()).refine((data) => data.length > 0, {
    message: 'At least one client member is required',
  }),
});


type FormValues = z.infer<typeof formSchema>;

interface CreateChatDialogProps {
  createChatMutation: UseMutationResult<
    Chats.Insert,
    Error,
    { name: string; memberIds: string[] },
    unknown
  >;
  agencyMembers: User.Response[];
  agencyOrganization: Account.Type;
  clientOrganization?: Account.Type;
}

export default function CreateOrganizationsChatDialog({
  createChatMutation,
  agencyMembers,
  agencyOrganization,
}: CreateChatDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: '',
      agencyMembers: [],
      clientMembers: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    const allMembers = [...data.agencyMembers, ...data.clientMembers];
    await createChatMutation.mutateAsync({
      name: data.name,
      memberIds: allMembers,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <SquarePen className="cursor-pointer text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className=" max-w-lg">
        <DialogTitle className="text-xl font-bold">
          Create a new chat
        </DialogTitle>


        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full min-w-0 space-y-6"
          >
            <FormField
              control={form.control}
              name="name"

              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-600">
                    Chat name
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Website design" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/*         
              <FormField
                control={form.control}
                name="agencyMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-500">
                      Agency Members
                    </FormLabel>
                    <FormControl>
                      <CheckboxCombobox
                        options={agencyMemberOptions}
                        defaultValues={{ members: field.value }}
                        schema={z.object({ members: z.array(z.string()) })}
                        onSubmit={(data) => field.onChange(data.members)}
                        values={field.value}
                        onChange={(values) => field.onChange(values)}
                        customItemTrigger={<span>+</span>}
                      />
                    </FormControl>
                  </FormItem>
                )}
              /> */}

            <FormField
              control={form.control}
              name="agencyMembers"
              render={() => (
                <FormItem>
                  <FormControl>
                    <OrganizationMemberAssignation
                      title="Agency"
                      form={form}
                      valueKey="agencyMembers"
                      schema={z.object({ members: z.array(z.string()) })}
                      defaultOrganization={agencyOrganization}
                      defaultMembers={agencyMembers}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientMembers"
              render={() => (
                <FormItem className="w-full">
                  <FormControl>
                    <OrganizationMemberAssignation
                      title="Name of the organization"
                      form={form}
                      valueKey="clientMembers"
                      schema={z.object({ members: z.array(z.string()) })}
                      fetchOrganizations={getClientsOrganizations}
                      fetchMembers={getClientMembersForOrganization}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ThemedButton
              type="submit"
              className="w-full"
              disabled={createChatMutation.isPending}
            >
              Create Chat
            </ThemedButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
