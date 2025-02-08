'use client';

import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { cn } from 'node_modules/@kit/ui/src/utils/cn';

import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Spinner } from '@kit/ui/spinner';

import { Members } from '~/lib/members.types';
import { User } from '~/lib/user.types';
import { getTeams } from '~/server/actions/team/team.action';

import { AvatarType } from '../../components/ui/multiavatar-displayer';
import MultiAvatarDisplayer from '../../components/ui/multiavatar-displayer';
import MembersAssignations from '../../components/users/member-assignations';

// import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface ChatMembersSelectorProps {
  agencyTeam: Members.Organization;
  selectedMembers: Members.Member[];
  onMembersUpdate: (userIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatMembersSelector({
  agencyTeam,
  selectedMembers, // This include both members selected from the agency and the client organizations
  onMembersUpdate,
  isLoading = false,
}: ChatMembersSelectorProps) {
  const agencyMembers = agencyTeam.members ?? [];

  const clientOrganizationIds = selectedMembers
    .map((member) => member.organization_id)
    .filter((id) => id !== agencyTeam.id) // don't include undefined
    .filter(Boolean);

  const clientMembersQuery = useQuery({
    queryKey: ['clientMembers', clientOrganizationIds],
    queryFn: () =>
      getTeams({
        organizationIds: clientOrganizationIds ?? [],
        includeMembers: true,
      }),
    enabled: !!clientOrganizationIds,
    retry: 4,
  });

  const clientOrganizationMembers = clientMembersQuery.data;

  const clientMembers = Object.values(clientOrganizationMembers ?? {}).flatMap(
    (team) => team?.members ?? [],
  );

  const selectedAgencyMembers =
    agencyMembers.filter((member) =>
      selectedMembers.map((m) => m.id).includes(member.id),
    ) ?? [];
    
  const selectedClientOrganizationMembers = selectedMembers.filter(
    (member) => member.organization_id && member.organization_id !== agencyTeam.id
  ) ?? [];

  const agencyMembersAvatars = selectedAgencyMembers.map((user) => ({
    id: user.id,
    name: user.name,
    picture_url: user.picture_url,
  }));

  const clientOrganizationMembersAvatars =
    selectedClientOrganizationMembers.map((user) => ({
      id: user.id,
      name: user.name,
      picture_url: user.picture_url,
    }));

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1">
      <Popover>
        <PopoverTrigger asChild>
          <button>
            <TriggerButton
              avatars={[
                ...clientOrganizationMembersAvatars,
                ...agencyMembersAvatars,
              ]}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn('w-[300px] rounded-md border bg-white p-6 shadow-md')}
          align="end"
          side="bottom"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Invite people to this chat</h3>
              <div className="my-2 h-px bg-gray-200" />
            </div>

            <div className="flex flex-col gap-6">
              <OrganizationMembersSelector
                title="Organization members"
                users={clientMembers ?? []}
                selectedUsers={selectedClientOrganizationMembers}
                onMembersUpdate={onMembersUpdate}
                isLoading={clientMembersQuery.isLoading}
              />

              <OrganizationMembersSelector
                title="Agency members"
                users={agencyMembers}
                selectedUsers={selectedAgencyMembers}
                onMembersUpdate={onMembersUpdate}
                isLoading={isLoading}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const TriggerButton = ({ avatars }: { avatars: AvatarType[] }) => {
  return (
    <div className="flex items-center gap-2">
      <MultiAvatarDisplayer avatars={avatars} className="w-fit" />
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-gray-200">
        <PlusIcon className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};

interface OrganizationMembersSelectorProps {
  title: string;
  users: User.Response[];
  selectedUsers: User.Response[];
  onMembersUpdate: (userIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

const OrganizationMembersSelector = ({
  title,
  users,
  selectedUsers,
  onMembersUpdate,
  isLoading,
}: OrganizationMembersSelectorProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      {isLoading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <MembersAssignations
          users={users}
          defaultSelectedUsers={selectedUsers}
          updateOrderUsersFn={onMembersUpdate}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
