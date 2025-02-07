'use client';

import { useMemo, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';

import CheckboxCombobox, {
  CustomItemProps,
  Option,
} from '~/components/ui/checkbox-combobox';
import SelectAction from '~/components/ui/select';
import { Account } from '~/lib/account.types';
import AvatarDisplayer from '~/orders/[id]/components/ui/avatar-displayer';

interface OrganizationMemberAssignationProps<T extends z.ZodSchema<unknown>> {
  form: UseFormReturn<z.infer<T> & FieldValues>;
  valueKey: Path<z.infer<T> & FieldValues>;
  schema: T;
  title?: string;
  defaultOrganization?: Partial<Account.Type>;
  defaultMembers?: Account.Type[];
  fetchOrganizations?: () => Promise<Account.Type[]>;
  fetchMembers?: (organizationId: string) => Promise<Account.Type[]>;
  onOrganizationChange?: (organizationId: string) => void;
  onMembersChange?: (memberIds: string[]) => void;
}

export default function OrganizationMemberAssignation<
  T extends z.ZodSchema<unknown>,
>({
  form,
  valueKey,
  schema,
  defaultOrganization,
  defaultMembers,
  title,
  fetchOrganizations,
  fetchMembers,
  onOrganizationChange,
  onMembersChange,
}: OrganizationMemberAssignationProps<T>) {
  const [selectedOrganization, setSelectedOrganization] =
    useState<Partial<Account.Type> | null>(defaultOrganization ?? null);
  const [selectedMembers, setSelectedMembers] = useState<Account.Type[]>([]);

  const { t } = useTranslation('orders');

  const organizationsQuery = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => await fetchOrganizations(),
    enabled: !!fetchOrganizations,
  });

  const membersQuery = useQuery({
    queryKey: ['members', selectedOrganization?.id],
    queryFn: () => fetchMembers(selectedOrganization?.id ?? ''),
    enabled: !!fetchMembers && !!selectedOrganization,
  });

  const onSelectHandler = (value: string) => {
    const newMember = defaultMembers
      ? defaultMembers.find((member) => member.id === value)
      : membersQuery.data?.find((member) => member.id === value);
    if (!newMember) return;

    setSelectedMembers((prevMembers) => {
      const isAlreadySelected = prevMembers.some(
        (member) => member.id === newMember.id,
      );
      const newMembers = isAlreadySelected
        ? prevMembers.filter((member) => member.id !== newMember.id)
        : [...prevMembers, newMember];

      form.setValue(
        valueKey,
        newMembers.map((member) => member.id) as PathValue<
          z.infer<T> & FieldValues,
          Path<z.infer<T> & FieldValues>
        >,
      );
      onMembersChange?.(newMembers.map((member) => member.id));
      return newMembers;
    });
  };

  const onRemoveHandler = (value: string) => {
    setSelectedMembers((prevMembers) => {
      const newMembers = prevMembers.filter((member) => member.id !== value);
      form.setValue(
        valueKey,
        newMembers.map((member) => member.id) as PathValue<
          z.infer<T> & FieldValues,
          Path<z.infer<T> & FieldValues>
        >,
      );
      onMembersChange?.(newMembers.map((member) => member.id));
      return newMembers;
    });
  };

  const organizationOptions = useMemo(
    () =>
      (defaultOrganization
        ? [defaultOrganization]
        : organizationsQuery?.data
      )?.map((org) => ({
        value: org.id,
        label: org.name,
      })) ?? [],
    [organizationsQuery.data, defaultOrganization],
  );

  const memberOptions = useMemo(
    () =>
      (defaultMembers ? [...defaultMembers] : membersQuery.data)?.map(
        (member) => ({
          value: member.id,
          label: member.name,
          picture_url: member.picture_url,
        }),
      ) ?? [],
    [membersQuery.data, defaultMembers],
  );

  const selectedMemberIds = selectedMembers.map((member) => member.id) ?? [];

  function handleFormSubmit() {
    form.setValue(
      valueKey,
      selectedMembers.map((member) => member.id) as PathValue<
        z.infer<T> & FieldValues,
        Path<z.infer<T> & FieldValues>
      >,
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
      <SelectAction
        options={organizationOptions}
        className="w-full bg-transparent"
        groupName={t('dialogs.add.select.label')}
        defaultValue={defaultOrganization?.id}
        onSelectHandler={(value: string) => {
          setSelectedOrganization(
            organizationsQuery?.data?.find((cOrg) => cOrg.id === value),
          );
          form.setValue(
            valueKey,
            [] as PathValue<
              z.infer<T> & FieldValues,
              Path<z.infer<T> & FieldValues>
            >,
          );
          setSelectedMembers([]);
          onOrganizationChange?.(value);
        }}
        customItem={(option: string) => customItem(option)}
        isLoading={organizationsQuery.isLoading || organizationsQuery.isPending}
      >
        <span className="text-sm text-gray-600">
          {title ?? t('form.completion.client.label')}
          <span className="text-red"> *</span>{' '}
          {/* Change text-red-500 to any desired color */}
        </span>
      </SelectAction>

      {selectedOrganization && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-600">
            {t('form.completion.client.members.label')}
            <span className="text-red"> *</span>{' '}
            {/* Change text-red-500 to any desired color */}
          </span>

          <CheckboxCombobox
            className="w-full"
            options={memberOptions}
            defaultValues={{ [valueKey]: selectedMemberIds }}
            values={selectedMemberIds}
            onSelect={onSelectHandler}
            schema={schema}
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
              fetchMembers &&
              fetchOrganizations &&
              (membersQuery.isLoading || membersQuery.isPending)
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
    <div className="flex h-fit w-full max-w-full items-center justify-between gap-2 rounded-md border border-gray-300 px-4 py-2">
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
                {member?.name}
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
      displayName={option.label}
    />
    <span>{option.label}</span>
  </div>
);
