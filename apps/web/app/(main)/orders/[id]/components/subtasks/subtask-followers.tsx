'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Spinner } from '@kit/ui/spinner';

import CheckboxCombobox, {
  CustomItemProps,
  Option,
} from '~/components/ui/checkbox-combobox';
import { getSubtaskFollowers } from '~/team-accounts/src/server/actions/tasks/get/get-tasks';

import AvatarDisplayer from '../ui/avatar-displayer';
import { UserPlus } from 'lucide-react';

const CustomUserItem: React.FC<
  CustomItemProps<
    Option & {
      picture_url?: string | null;
    }
  >
> = ({ option }) => (
  <div className="flex items-center space-x-2">
    <AvatarDisplayer
      className="font-normal"
      pictureUrl={option?.picture_url ?? null}
      displayName={option.label}
    />
    <span>
      { option.label }
    </span>
  </div>
);
interface ActivityAssignationProps {
  subtaskId: string;
  onUserSelectionChange: (selectedUsers: string[]) => void;
  searchUserOptions: {
    picture_url: string | null;
    value: string;
    label: string;
  }[];
}

const SubtaskFollowers = ({
  subtaskId,
  onUserSelectionChange,
  searchUserOptions,
}: ActivityAssignationProps) => {
  const { t } = useTranslation('orders');

  const { data: followers, isLoading } = useQuery({
    queryKey: ['subtask_followers', subtaskId],
    queryFn: () => getSubtaskFollowers(subtaskId),
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    followers?.map((user) => user.client_member_id) ?? [],
  );
  const loading = isLoading;

  const avatarsWithStatus =
    followers?.map((account) => ({
      ...account.accounts,
      status: undefined,
    })) ?? [];

  const membersAssignedSchema = z.object({
    agency_members: z.array(z.string()),
  });

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    const selected = data.agency_members;
    setSelectedUsers(selected);
    onUserSelectionChange(selected);
  }

  const defaultValues = {
    agency_members: selectedUsers,
  };

  return (
    <div className="flex gap-2 items-center justify-between h-10">
      <div className='flex items-center'>
        <UserPlus className="h-4 w-4 mr-2" />
        <span className="font-semibold text-sm">{t('details.followedBy')}</span>
      </div>
      
        <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-end gap-0 overflow-y-auto">
          {loading && (
            <div className='items-center flex'>
              <Spinner className="h-4 w-4" />
          </div>
          )}
          {!loading && (
            <>
            {avatarsWithStatus.map((avatar, index) => {
              const displayName = avatar.name
        
              return (
                <AvatarDisplayer
                  isTask={true}
                  displayName={
                    displayName
                  }
                  isAssignedOrFollower={true}
                  pictureUrl={avatar?.picture_url}
                  key={index + avatar?.name}
                  status={avatar?.status}
                  className={'h-8 w-8 border-none'}
                />
              );
            })}
            <CheckboxCombobox
              options={searchUserOptions ?? []}
              onSubmit={handleFormSubmit}
              schema={membersAssignedSchema}
              defaultValues={defaultValues}
              customItem={CustomUserItem}
            />
            </>
          )}
        </div>
    </div>
  );
};
export default SubtaskFollowers;