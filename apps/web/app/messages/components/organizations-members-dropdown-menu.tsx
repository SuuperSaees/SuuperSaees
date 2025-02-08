import { PlusIcon } from 'lucide-react';
import { cn } from 'node_modules/@kit/ui/src/utils/cn';

import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import { User } from '~/lib/user.types';

import MultiAvatarDisplayer, {
  AvatarType,
} from '../../components/ui/multiavatar-displayer';
import MembersAssignations from '../../components/users/member-assignations';

interface OrganizationMembersDropdownMenuProps {
  agencyMembers: User.Response[];
  selectedAgencyMembers: User.Response[];
  clientOrganizationMembers: User.Response[];
  selectedClientOrganizationMembers: User.Response[];
  onMembersUpdate: (userIds: string[]) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const OrganizationsMembersDropdownMenu = ({
  agencyMembers,
  selectedAgencyMembers,
  clientOrganizationMembers,
  selectedClientOrganizationMembers,
  onMembersUpdate,
  isLoading,
  className,
}: OrganizationMembersDropdownMenuProps) => {
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

  return (
    <div className={className}>
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
                users={clientOrganizationMembers}
                selectedUsers={selectedClientOrganizationMembers}
                onMembersUpdate={onMembersUpdate}
                isLoading={isLoading}
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
};

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
      <MembersAssignations
        users={users}
        defaultSelectedUsers={selectedUsers}
        updateOrderUsersFn={onMembersUpdate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default OrganizationsMembersDropdownMenu;
