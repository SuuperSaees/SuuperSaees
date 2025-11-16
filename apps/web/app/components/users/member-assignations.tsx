import { useMemo, useState } from 'react';

import { z } from 'zod';

import { Option } from '~/components/ui/checkbox-combobox';
import { User } from '~/lib/user.types';

import Avatar from '../ui/avatar';
import { MultiAvatarDropdownDisplayer } from '../ui/multiavatar-displayer';

interface MembersProps {
  users: Omit<User.Response, 'organization_id' | 'settings'>[];
  defaultSelectedUsers: Omit<User.Response, 'organization_id' | 'settings'>[];
  updateOrderUsersFn: (userIds: string[]) => Promise<void>;
  avatarClassName?: string;
  className?: string;
  isLoading?: boolean;
  [key: string]: unknown;
}

const MembersAssignations = ({
  users = [],
  defaultSelectedUsers = [],
  className,
  avatarClassName,
  updateOrderUsersFn,
  isLoading,
  canAddMembers = true,
}: MembersProps) => {
  const membersAssignedSchema = z.object({
    members: z.array(z.string()),
  });

  const [selectedUsers, setSelectedUsers] =
    useState<Omit<User.Response, 'organization_id' | 'settings'>[]>(
      defaultSelectedUsers,
    );
  const onSelectedUsersChange = (ids: string[]) => {
    setSelectedUsers(users?.filter((user) => ids.includes(user.id)));
  };
  const avatars =
    selectedUsers?.map((user) => ({
      name: user.name,
      picture_url: user.picture_url,
    })) ?? [];

  const defaultValues = {
    members: selectedUsers?.map((user) => user.id),
  };

  async function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    return await updateOrderUsersFn(data.members);
  }

  const searchUserOptions = useMemo(
    () =>
      users?.map((user) => ({
        picture_url: user.picture_url ?? '',
        value: user?.id,
        label: user?.name ?? '',
      })) ?? [],
    [users],
  );

  const maxAvatars = 3;
  const CustomItemTrigger = (
    canAddMembers ? (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-white bg-gray-200 text-sm font-bold text-gray-600 ${avatarClassName} ${!avatarClassName?.includes('h-') && 'h-8 w-8'}`}
    >
      +{maxAvatars >= avatars.length ? '' : avatars.length - maxAvatars}
    </div>
  ) : (
    <div />
  ))




  return (
    <div className="flex items-center gap-2">
      <MultiAvatarDropdownDisplayer
        avatars={avatars ?? []}
        displayNormal
        className={className}
        avatarClassName={'border-white border-[0.5px] w-6 h-6' + avatarClassName}
        maxAvatars={maxAvatars}
        options={searchUserOptions ?? []}
        onSubmit={handleFormSubmit}
        schema={membersAssignedSchema}
        defaultValues={defaultValues}
        customItem={CustomUserItem}
        customItemTrigger={CustomItemTrigger}
        onChange={onSelectedUsersChange}
        isLoading={isLoading}
      />
    </div>
  );
};

const CustomUserItem = ({
  option,
}: {
  option: Option & { picture_url?: string | null };
}) => (
  <div className="flex items-center space-x-1">
    <Avatar
      className="font-normal"
      src={option?.picture_url ?? ''}
      username={option?.label ?? ''}
      alt={option?.label ?? ''}
    />
    <span>{option?.label}</span>
  </div>
);

export default MembersAssignations;
