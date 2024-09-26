'use client';

// import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import CheckboxCombobox, {
  CustomItemProps,
  Option,
} from '~/components/ui/checkbox-combobox';
import { Order } from '~/lib/order.types';

import AvatarDisplayer from './ui/avatar-displayer';
import MultiAvatarDisplayer from './ui/multi-avatar-displayer';

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
}

const ActivityFollowers = ({
  followers,
  updateFunction,
  searchUserOptions,
}: ActivityAssignationProps) => {
  const { t } = useTranslation('orders');

  const avatarsWithStatus =
  followers?.map((account) => ({
      ...account.client_follower,
      status: undefined,
    })) ?? [];

  const membersAssignedSchema = z.object({
    agency_members: z.array(z.string()),
  });

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    updateFunction(data.agency_members);
  }
  const defaultValues = {
    agency_members: followers
      ? followers.map((option) => option.client_follower.id)
      : [],
  };
  // console.log('assignedTo', assignedTo);
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">{t('details.followedBy')}</span>
      <div className="flex flex-wrap items-center">
        <MultiAvatarDisplayer avatars={avatarsWithStatus} maxAvatars={4} />
        {/* <button className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-300">
          <Plus />
        </button> */}
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
export default ActivityFollowers;
