import { cn } from 'node_modules/@kit/ui/src/utils/cn';

import { User } from '~/lib/user.types';

import {
  CustomDropdownMenu,
  MenuItem,
} from '../../components/ui/dropdown-menu';
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
  const agencyMembersAvatars = agencyMembers.map((user) => ({
    id: user.id,
    name: user.name,
    picture_url: user.picture_url,
  }));

  const clientOrganizationMembersAvatars = clientOrganizationMembers.map(
    (user) => ({
      id: user.id,
      name: user.name,
      picture_url: user.picture_url,
    }),
  );

  const configMenu: MenuItem[] = [
    {
      id: 'header',
      type: 'label',
      label: 'Invite people to this chat',
      className: 'text-lg font-inherit font-bold',
    },
    {
      id: 'separator',
      type: 'separator',
    },

    {
      id: 'content',
      type: 'submenu',
      label: 'Contenta',
      content: (
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
      ),

      displaySelection: false,
    },
  ];

  return (
    <CustomDropdownMenu
      side="bottom"
      align="end"
      trigger={
        <button>
          {
            <TriggerButton
              avatars={[
                ...clientOrganizationMembersAvatars,
                ...agencyMembersAvatars,
              ]}
            />
          }
        </button>
      }
      items={configMenu}
      className={cn('w-[300px] p-4', className)}
    />
  );
};

const TriggerButton = ({ avatars }: { avatars: AvatarType[] }) => {
  return <MultiAvatarDisplayer avatars={avatars} className="w-fit" />;
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
