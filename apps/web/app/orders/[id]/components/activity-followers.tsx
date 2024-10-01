'use client';

// import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';



import CheckboxCombobox, { CustomItemProps, Option } from '~/components/ui/checkbox-combobox';
import { Order } from '~/lib/order.types';



import deduceNameFromEmail from '../utils/deduce-name-from-email';
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
    <span>{deduceNameFromEmail(option.label)}</span>
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
      </div>
      <CheckboxCombobox
        options={searchUserOptions ?? []}
        onSubmit={handleFormSubmit}
        schema={membersAssignedSchema}
        defaultValues={defaultValues}
        customItem={CustomUserItem}
      />
    </div>
  );
};
export default ActivityFollowers;