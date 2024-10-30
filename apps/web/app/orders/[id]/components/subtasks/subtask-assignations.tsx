'use client';

// import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';



import CheckboxCombobox, { CustomItemProps, Option } from '~/components/ui/checkbox-combobox';
import AvatarDisplayer from '../ui/avatar-displayer';
import deduceNameFromEmail from '../../utils/deduce-name-from-email';
import { Subtask } from '~/lib/tasks.types';
import { useState } from 'react';




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
      displayName={deduceNameFromEmail(option.label) ?? option.label}
    />
    <span>{deduceNameFromEmail(option.label)}</span>
  </div>
);
interface SubtaskAssignationProps {
    subtaskId: string;
  assignedTo: Subtask.Type['assigned_to'];
  onUserSelectionChange: (selectedUsers: string[]) => void;
  searchUserOptions: {
    picture_url: string | null;
    value: string;
    label: string;
  }[];
}

const SubtaskAssignations = ({
  assignedTo,
  onUserSelectionChange,
  searchUserOptions,
}: SubtaskAssignationProps) => {
  const { t } = useTranslation('orders');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(assignedTo?.map(user => user.agency_member_id) ?? []);

  const avatarsWithStatus =
    assignedTo?.map((account) => ({
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
    <div className="flex flex-col gap-2">
      <span className="font-semibold">{t('details.assignedTo')}</span>
      <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
        {avatarsWithStatus.map((avatar, index) => {
          return (
            <AvatarDisplayer
              displayName={
                deduceNameFromEmail(avatar?.email ?? '') ?? avatar?.name
              }
              isAssignedOrFollower={true}
              pictureUrl={avatar?.picture_url}
              key={index + avatar?.name}
              status={avatar?.status}
              className={'h-8 w-8 border-2 border-white'}
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
      </div>
    </div>
  );
};
export default SubtaskAssignations;