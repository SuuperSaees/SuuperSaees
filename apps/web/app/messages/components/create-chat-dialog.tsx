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
  DialogClose,
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
import { Members } from '~/lib/members.types';
import {
  getClientMembersForOrganization,
  getClientsOrganizations,
} from '~/team-accounts/src/server/actions/clients/get/get-clients';

import OrganizationMemberAssignation from '../../components/users/organization-members-assignations';
import { Dispatch, SetStateAction } from 'react';

// Dialog to create a new chat

// const formSchema = z.object({
//   name: z.string().min(1),
//   agencyMembers: z.array(z.string()).refine((data) => data.length > 0, {
//     message: 'At least one agency member is required',
//   }),
//   clientMembers: z.array(z.string()).refine((data) => data.length > 0, {
//     message: 'At least one client member is required',
//   }),
//   image: z.string().optional(),
// });

const formSchema = z.object({
  name: z.string().min(1),
  agencyMembers: z.array(z.string()),
  clientMembers: z.array(z.string()),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateChatDialogProps {
  createChatMutation: UseMutationResult<
    Chats.Insert,
    Error,
    { name: string; members: {id: string, role: string, visibility: boolean}[]; image?: string },
    unknown
  >;
  agencyMembers: Members.Member[];

  agencyOrganization: Members.Organization;
  clientOrganization?: Account.Type;
  isChatCreationDialogOpen: boolean;
  setIsChatCreationDialogOpen: Dispatch<SetStateAction<boolean>>;
}


export default function CreateOrganizationsChatDialog({
  createChatMutation,
  agencyMembers,
  clientOrganization,
  agencyOrganization,
  isChatCreationDialogOpen,
  setIsChatCreationDialogOpen,
}: CreateChatDialogProps) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),




    defaultValues: {
      name: '',
      agencyMembers: [],
      clientMembers: [],
      image: clientOrganization?.picture_url ?? '',
    },
  });

const onSubmit = async (data: FormValues) => {
  // Create a map of agency members for faster lookups
  const agencyMembersMap = new Map(
    agencyMembers.map(member => [member.id, member.role])
  );

  // Define management roles that should have visibility false
  const managementRoles = new Set(['agency_owner', 'agency_project_manager']);
  
  // Get default members (owners and PMs)
  const defaultMembers = agencyMembers
    .filter((member) => managementRoles.has(member.role))
    .map((member) => member.id);


  // Combine all members and remove duplicates
  const uniqueMembers = [...new Set([...defaultMembers, ...data.agencyMembers, ...data.clientMembers])];

  await createChatMutation.mutateAsync({
    name: data.name,
    members: uniqueMembers.map(memberId => {
      const role = agencyMembersMap.get(memberId) ?? '';
      return {
        id: memberId,
        role,
        visibility: !managementRoles.has(role)
      };
    }),
    image: form.getValues('image'),
  });
};

  return (
    <Dialog open={isChatCreationDialogOpen} onOpenChange={() => setIsChatCreationDialogOpen(!isChatCreationDialogOpen)}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <SquarePen className="cursor-pointer text-gray-600" />

        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" >
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
                      setImage={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogClose asChild disabled={createChatMutation.isPending}>

              <ThemedButton
                type="submit"
                className="w-full"
                disabled={createChatMutation.isPending}

              >
                Create Chat
              </ThemedButton>
          </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
