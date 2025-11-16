// Dialog to create a new chat
'use client';

import { Dispatch, SetStateAction } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import { SquarePen } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
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
import { Spinner } from '@kit/ui/spinner';

import { Account } from '~/lib/account.types';
import { Chats } from '~/lib/chats.types';
import { Members } from '~/lib/members.types';
import {
  getClientMembersForOrganization,
  getClientsOrganizations,
} from '~/team-accounts/src/server/actions/clients/get/get-clients';

import OrganizationMemberAssignation from '../../../components/users/organization-members-assignations';
import { useChat } from './context/chat-context';



const formSchema = z.object({
  name: z.string().min(1),
  agencyMembers: z.array(z.string()),
  clientMembers: z.array(z.string()).refine((data) => data.length > 0, {
    message: 'At least one client member is required',
  }),
  image: z.string().optional(),
  clientOrganizationId: z.string().optional(),
  agencyId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateChatDialogProps {
  createChatMutation: UseMutationResult<
    Chats.Insert,
    Error,
    {
      name: string;
      members: { id: string; role: string; visibility: boolean }[];
      image?: string;
      clientOrganizationId?: string;
      agencyId?: string ;
    },
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
  const { setActiveChat } = useChat();
  const { workspace: userWorkspace } = useUserWorkspace();
  const currentUserRole = userWorkspace?.role;
  // Define management roles that should have visibility false
  const agencyRoles = [
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ];
  const clientRoles = ['client_owner', 'client_member'];
  const managementRoles = new Set(['agency_owner', 'agency_project_manager']);
  const isValidAgencyManager = currentUserRole
    ? managementRoles.has(currentUserRole)
    : false;

  // Get default members (owners and PMs)
  const defaultMembers = agencyMembers.filter((member) =>
    managementRoles.has(member.role),
  );

  //Default only the self user and if belongs to agency or client based on the user role
  const defaultAgencyMembers = agencyRoles.includes(currentUserRole ?? '')
    ? [userWorkspace]
    : [];
  const defaultClientMembers = clientRoles.includes(currentUserRole ?? '')
    ? [userWorkspace]
    : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: '',
      agencyMembers: defaultAgencyMembers
        .map((member) => member?.id ?? '')
        .filter((id) => id !== ''),
      clientMembers: defaultClientMembers
        .map((member) => member?.id ?? '')
        .filter((id) => id !== ''),
      image: clientOrganization?.picture_url ?? '',
      clientOrganizationId: clientOrganization?.id ?? undefined,
      agencyId: agencyOrganization?.id ?? undefined,
    },
  });
  const onSubmit = async (data: FormValues) => {
    // Create a map of agency members for faster lookups
    const agencyMembersMap = new Map(
      agencyMembers.map((member) => [member.id, member.role]),
    );

    const defaultMembersIds = defaultMembers.map((member) => member.id);
    // Combine all members and remove duplicates
    const uniqueMembers = [
      ...new Set([
        ...defaultMembersIds,
        ...data.agencyMembers,
        ...data.clientMembers,
      ]),
    ];

    const isClientCreating = clientRoles.includes(currentUserRole ?? '');

    const members = uniqueMembers.map((memberId) => {
      const role = agencyMembersMap.get(memberId) ?? '';
      const isManagementRole = managementRoles.has(role);
      const isClientMember = data.clientMembers.includes(memberId);
      // If client is creating, management roles should be visible
      // If agency is creating, explicitly selected members should be visible
      const shouldBeVisible = !isManagementRole;

      return {
        id: memberId,
        role,
        visibility: shouldBeVisible,
      };
    });

    const image = form.getValues('image');
    const newChat = await createChatMutation.mutateAsync({
      name: data.name,
      members: members,
      image: image,
      clientOrganizationId: data.clientOrganizationId,
      agencyId: data.agencyId,
    });
    if (newChat?.id) {
      setActiveChat(newChat as Chats.TypeWithRelations);
      setIsChatCreationDialogOpen(false);
    }
    // clear form
    form.reset();
  };
  return (
    <Dialog
      open={isChatCreationDialogOpen}
      onOpenChange={() =>
        setIsChatCreationDialogOpen(!isChatCreationDialogOpen)
      }
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <SquarePen className="cursor-pointer text-gray-900 w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
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
                      organization={agencyOrganization}
                      members={agencyMembers}
                      // in default only the self user and if belongs to agency or client
                      defaultMembers={defaultAgencyMembers}
                      // defaultMembers={defaultMembers}
                      disabledOrganizationSelector={true}
                      disabledMembersSelector={!isValidAgencyManager}
                      hideOrganizationSelector
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
                      fetchOrganizations={
                        clientOrganization ? undefined : getClientsOrganizations
                      }
                      defaultMembers={defaultClientMembers}
                      fetchMembers={getClientMembersForOrganization}
                      organization={clientOrganization}
                      setImage={true}
                      hideOrganizationSelector={!isValidAgencyManager}
                      organizationIdKey="clientOrganizationId"
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
              {createChatMutation.isPending && (
                <Spinner className="ml-2 h-4 w-4" />
              )}
            </ThemedButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
