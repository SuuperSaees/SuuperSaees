'use client';

// import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import CheckboxCombobox, {
  CustomItemProps,
  Option,
} from '~/components/ui/checkbox-combobox';
import { Order } from '~/lib/order.types';

import AvatarDisplayer from './ui/avatar-displayer';

// import { CalendarIcon } from 'lucide-react';
// import { DatePicker } from '~/components/date-seletc';

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
    <span>{option.label}</span>
  </div>
);

interface ActivityAssignationProps {
  assignedTo: Order.Type['assigned_to'];
  updateFunction: (data: string[]) => void;
  searchUserOptions: {
    picture_url: string | null;
    value: string;
    label: string;
  }[];
  canAddAssignes: boolean;
  isLoading?: boolean;
}

const ActivityAssignations = ({
  assignedTo,
  updateFunction,
  searchUserOptions,
  canAddAssignes = false,
  isLoading = false,
}: ActivityAssignationProps) => {
  const { t } = useTranslation('orders');

  // Add state to track current selections
  const [currentAssigned, setCurrentAssigned] = useState(assignedTo || []);

  // Update local state when prop changes
  useEffect(() => {
    setCurrentAssigned(assignedTo || []);
  }, [assignedTo]);

  const avatarsWithStatus = currentAssigned.map((account) => ({
    ...account.agency_member,
    status: undefined,
  }));

  const membersAssignedSchema = z.object({
    agency_members: z.array(z.string()),
  });

  const defaultValues = {
    agency_members: currentAssigned.map((option) => option.agency_member.id),
  };

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    updateFunction(data.agency_members);
  }

  // Add onChange handler for immediate UI updates
  const handleSelectionChange = (selectedIds: string[]) => {
    // Create new assigned array based on selected IDs
    const newAssigned = selectedIds
      .map((id) => {
        // Find the original assigned entry or create a new one from searchUserOptions
        const existing = assignedTo?.find((a) => a.agency_member.id === id);
        if (existing) return existing;

        const userOption = searchUserOptions.find((o) => o.value === id);
        if (!userOption) return null;

        return {
          agency_member: {
            id: userOption.value,
            name: userOption.label,
            settings: {
              name: userOption.label,
              picture_url: userOption.picture_url,
            },
            picture_url: userOption.picture_url,
          },
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    setCurrentAssigned(newAssigned);
    updateFunction(selectedIds);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="py-1.5 text-sm font-medium">
        {t('details.assignedTo')}
      </span>
      <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
        {avatarsWithStatus.map((avatar, index) => (
          <AvatarDisplayer
            key={avatar.id || index}
            displayName={avatar?.settings?.name ?? avatar?.name ?? ''}
            isAssignedOrFollower={true}
            pictureUrl={avatar?.settings?.picture_url ?? avatar?.picture_url}
            status={avatar?.status}
            className="h-8 w-8 border-2 border-white"
          />
        ))}
        {canAddAssignes && (
          <CheckboxCombobox
            options={searchUserOptions ?? []}
            onSubmit={handleFormSubmit}
            schema={membersAssignedSchema}
            defaultValues={defaultValues}
            customItem={CustomUserItem}
            isLoading={isLoading}
            onChange={handleSelectionChange}
            values={currentAssigned.map((a) => a.agency_member.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityAssignations;
