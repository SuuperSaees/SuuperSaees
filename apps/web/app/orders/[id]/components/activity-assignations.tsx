'use client';

// import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';



import CheckboxCombobox, { CustomItemProps, Option } from '~/components/ui/checkbox-combobox';
import { Order } from '~/lib/order.types';



import AvatarDisplayer from './ui/avatar-displayer';
import { CalendarIcon } from 'lucide-react';
import { DatePicker } from '~/components/date-seletc';


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
}

const ActivityAssignations = ({
  assignedTo,
  updateFunction,
  searchUserOptions,
  canAddAssignes = false,
}: ActivityAssignationProps) => {
  const { t } = useTranslation('orders');

  const avatarsWithStatus =
    assignedTo?.map((account) => ({
      ...account.agency_member,
      status: undefined,
    })) ?? [];

  const membersAssignedSchema = z.object({
    agency_members: z.array(z.string()),
  });

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    updateFunction(data.agency_members);
  }
  const defaultValues = {
    agency_members: assignedTo
      ? assignedTo.map((option) => option.agency_member.id)
      : [],
  };
  
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium py-1.5">{t('details.assignedTo')}</span>
      <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
        
        {avatarsWithStatus.map((avatar, index) => {
          return (
            <AvatarDisplayer
              displayName={
                avatar?.settings?.name ?? avatar?.name ?? ''
              }
              isAssignedOrFollower={true}
              pictureUrl={avatar?.settings?.picture_url ?? avatar?.picture_url}
              key={index + avatar?.name}
              status={avatar?.status}
              className={'h-8 w-8 border-2 border-white'}
            />
          );
        })}
        {canAddAssignes && (
          <CheckboxCombobox
            options={searchUserOptions ?? []}
            onSubmit={handleFormSubmit}
            schema={membersAssignedSchema}
            defaultValues={defaultValues}
            customItem={CustomUserItem}
        />
        )}
      </div>
    </div>
  );
};
export default ActivityAssignations;