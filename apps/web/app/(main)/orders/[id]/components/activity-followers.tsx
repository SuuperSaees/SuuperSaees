'use client';

import { useState } from 'react';
import type React from 'react';

import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import CheckboxCombobox, {
  type CustomItemProps,
  type Option,
} from '~/components/ui/checkbox-combobox';
import type { Order } from '~/lib/order.types';

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

interface ActivityAssignationProps {
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
}: ActivityAssignationProps) => {
  const { t } = useTranslation('orders');
  const [selectedFollowers, setSelectedFollowers] = useState(
    followers?.map((follower) => follower.client_follower.id) ?? [],
  );

  // Update avatarsWithStatus based on selected followers
  const avatarsWithStatus = selectedFollowers.map((followerId) => {
    // First try to find in followers
    const follower = followers?.find(
      (f) => f.client_follower.id === followerId,
    )?.client_follower
    // If not found, search in searchUserOptions
    if (!follower) {
      const searchOption = searchUserOptions.find((option) => option.value === followerId);
      if (searchOption) {
        return {
          id: searchOption.value,
          name: searchOption.label,
          picture_url: searchOption.picture_url,
          settings: {
            name: searchOption.label,
            picture_url: searchOption.picture_url,
          },
          status: undefined,
        };
      }
    }
    return {
      ...follower,
      status: undefined,
    };
  });

  const membersAssignedSchema = z.object({
    agency_members: z.array(z.string()),
  });

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    updateFunction(data.agency_members);
  }

  const defaultValues = {
    agency_members: selectedFollowers,
  };

  const handleChange = (newValues: string[]) => {
    setSelectedFollowers(newValues);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="py-1.5 text-sm font-medium">
        {t('details.followedBy')}
      </span>
      <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
        {avatarsWithStatus.map((avatar, index) => (
          <AvatarDisplayer
            key={avatar?.id ?? index}
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
            values={selectedFollowers}
            onChange={handleChange}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityFollowers;
