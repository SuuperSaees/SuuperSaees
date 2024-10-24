'use client';

import { useMemo, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { useMultiStepFormContext } from '@kit/ui/multi-step-form';

import CheckboxCombobox, {
  CustomItemProps,
  Option,
} from '~/components/ui/checkbox-combobox';
import SelectAction from '~/components/ui/select';
import { Account } from '~/lib/account.types';
import AvatarDisplayer from '~/orders/[id]/components/ui/avatar-displayer';
import deduceNameFromEmail from '~/orders/[id]/utils/deduce-name-from-email';
import {
  getClientMembersForOrganization,
  getClientsOrganizations,
} from '~/team-accounts/src/server/actions/clients/get/get-clients';

export default function ClientAssignation() {
  const { form } = useMultiStepFormContext();

  const [selectedOrganization, setSelectedOrganization] =
    useState<Partial<Account.Type> | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<Account.Type[]>([]);

  const { t } = useTranslation('orders');

  const clientsOrganizationsQuery = useQuery({
    queryKey: ['clientsOrganizations'],
    queryFn: async () => await getClientsOrganizations(),
  });

  // fetch organization client members and refetch when the organization changes
  const clientMembersQuery = useQuery({
    queryKey: ['clientMembers', selectedOrganization?.id],
    queryFn: async () =>
      await getClientMembersForOrganization(
        selectedOrganization?.id ?? undefined,
      ),
    enabled: !!selectedOrganization,
  });

  const onSelectHandler = (value: string) => {
    const newMember = clientMembersQuery.data?.find(
      (member) => member.id === value,
    );
    if (!newMember) return;

    setSelectedMembers((prevMembers) => {
      const isAlreadySelected = prevMembers.some(
        (member) => member.id === newMember.id,
      );
      if (!isAlreadySelected) {
        const newMembers = [...prevMembers, newMember];
        form.setValue(
          'briefCompletion.order_followers',
          newMembers.map((member) => member.id),
        );
        return newMembers;
      } else {
        const newMembers = prevMembers.filter(
          (member) => member.id !== newMember.id,
        );
        form.setValue(
          'briefCompletion.order_followers',
          newMembers.map((member) => member.id),
        );
        return newMembers;
      }
    });
  };

  const onRemoveHandler = (value: string) => {
    setSelectedMembers((prevMembers) => {
      const newMembers = prevMembers?.filter((member) => member.id !== value);
      form.setValue(
        'briefCompletion.order_followers',
        newMembers.map((member) => member.id),
      );
      return newMembers;
    });
  };

  const membersAssignedSchema = z.object({
    order_assignations: z.array(z.string()),
  });

  const organizationOptions = useMemo(() => {
    return (
      clientsOrganizationsQuery.data?.map((organization) => ({
        value: organization.id,
        label: organization.name,
      })) ?? []
    );
  }, [clientsOrganizationsQuery.data]);

  const memberOptions = useMemo(() => {
    return (
      clientMembersQuery.data?.map((member) => ({
        value: member.id,
        label: member.name,
      })) ?? []
    );
  }, [clientMembersQuery.data]);

  const selectedMemberIds = selectedMembers.map((member) => member.id) ?? [];

  function handleFormSubmit() {
    form.setValue(
      'briefCompletion.order_followers',
      selectedMembers.map((member) => member.id),
    );
  }

  const customItem = (option: string) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={selectedOrganization?.picture_url ?? ''} />
        <AvatarFallback>{option.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-semibold">{option}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 border-t border-gray-100 py-2">
      <h3 className="text-xl font-semibold">
        {t('form.completion.client.title')}
      </h3>
      <div>
        <SelectAction
          options={organizationOptions}
          className="w-full bg-transparent"
          groupName={t('dialogs.add.select.label')}
          onSelectHandler={(value: string) => {
            setSelectedOrganization(
              clientsOrganizationsQuery?.data?.find(
                (cOrg) => cOrg.id === value,
              ),
            );
            form.setValue('briefCompletion.order_followers', undefined);
            setSelectedMembers([]);
          }}
          customItem={(option: string) => customItem(option)}
          isLoading={
            clientsOrganizationsQuery.isLoading ||
            clientsOrganizationsQuery.isPending
          }
        >
          <span className="text-sm text-gray-700">
            {t('form.completion.client.label')}
            <span className="text-[#7F56D9]"> *</span>{' '}
            {/* Change text-red-500 to any desired color */}
          </span>
        </SelectAction>
      </div>
      {selectedOrganization && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {t('form.completion.client.members.label')}
            <span className="text-[#7F56D9]"> *</span>{' '}
            {/* Change text-red-500 to any desired color */}
          </span>

          <CheckboxCombobox
            className="w-full"
            options={memberOptions}
            defaultValues={{ order_assignations: selectedMemberIds }}
            values={selectedMemberIds}
            onSelect={onSelectHandler}
            schema={membersAssignedSchema}
            onSubmit={handleFormSubmit}
            customItem={CustomUserItem}
            customItemTrigger={
              <CustomTrigger
                members={selectedMembers}
                onRemoveHandler={onRemoveHandler}
              />
            }
            classNameTrigger="w-full h-fit"
            isLoading={
              clientMembersQuery.isLoading || clientMembersQuery.isPending
            }
          />
        </div>
      )}
    </div>
  );
}

const CustomTrigger = ({
  members,
  onRemoveHandler,
}: {
  members: Account.Type[];
  onRemoveHandler: (value: string) => void;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to handle horizontal scroll
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      event.preventDefault(); // Prevent the default vertical scroll
      scrollContainerRef.current.scrollLeft += event.deltaY; // Adjust horizontal scroll based on vertical scroll amount
    }
  };

  return (
    <div className="flex h-fit w-full items-center justify-between gap-2 rounded-md border border-gray-300 px-4 py-2">
      <Search className="h-4 w-4 text-gray-600" />
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex w-full max-w-full gap-2 overflow-x-auto whitespace-nowrap"
        onWheel={handleWheel} // Add the wheel event listener
      >
        {members?.map((member, index) => {
          return (
            <div
              className="flex w-fit items-center justify-between gap-2 rounded-md border border-gray-300 px-2 py-1"
              key={index}
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={member?.picture_url ?? ''} />
                <AvatarFallback>
                  {member?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-gray-600">
                {deduceNameFromEmail(member?.name)}
              </span>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200"
                onClick={() => onRemoveHandler(member.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
