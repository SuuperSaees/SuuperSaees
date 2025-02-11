'use client';

// import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import CheckboxCombobox, {
  CustomItemProps,
  Option,
} from '~/components/ui/checkbox-combobox';
import { Order } from '~/lib/order.types';

import AvatarDisplayer from './ui/avatar-displayer';

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

interface ActivityFollowersProps {
  followers: Order.Type['followers'];
  updateFunction: (data: string[]) => void;
  searchUserOptions: {
    picture_url: string | null;
    value: string;
    label: string;
  }[];
  canAddFollowers?: boolean;
  isLoading?: boolean;
}

const ActivityFollowers = ({
  followers,
  updateFunction,
  searchUserOptions,
  canAddFollowers = true,
  isLoading = false,
}: ActivityFollowersProps) => {
  const { t } = useTranslation('orders');

  // Add state to track current selections
  const [currentFollowers, setCurrentFollowers] = useState(followers || []);

  // Update local state when prop changes
  useEffect(() => {
    setCurrentFollowers(followers || []);
  }, [followers]);

  const avatarsWithStatus = currentFollowers.map((account) => ({
    ...account.client_follower,
    status: undefined,
  }));

  const membersAssignedSchema = z.object({
    order_followers: z.array(z.string()),
  });

  const defaultValues = {
    order_followers: currentFollowers.map((option) => option.client_follower.id),
  };

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    updateFunction(data.order_followers);
  }

  // Add onChange handler for immediate UI updates
  const handleSelectionChange = (selectedIds: string[]) => {
    // Create new followers array based on selected IDs
    const newFollowers = selectedIds
      .map((id) => {
        // Find the original follower entry or create a new one from searchUserOptions
        const existing = followers?.find((f) => f.client_follower.id === id);
        if (existing) return existing;

        const userOption = searchUserOptions.find((o) => o.value === id);
        if (!userOption) return null;

        return {
          client_follower: {
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

    setCurrentFollowers(newFollowers);
    updateFunction(selectedIds);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="py-1.5 text-sm font-medium">
        {t('details.followedBy')}
      </span>
      <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
        {avatarsWithStatus.map((avatar) => (
          <AvatarDisplayer
            key={avatar.id}
            displayName={avatar?.settings?.name ?? avatar?.name ?? ''}
            isAssignedOrFollower={true}
            pictureUrl={avatar?.settings?.picture_url ?? avatar?.picture_url}
            status={avatar?.status}
            className="h-8 w-8 border-2 border-white"
          />
        ))}
        {canAddFollowers && (
          <CheckboxCombobox
            options={searchUserOptions ?? []}
            onSubmit={handleFormSubmit}
            schema={membersAssignedSchema}
            defaultValues={defaultValues}
            customItem={CustomUserItem}
            isLoading={isLoading}
            onChange={handleSelectionChange}
            values={currentFollowers.map((f) => f.client_follower.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityFollowers;
