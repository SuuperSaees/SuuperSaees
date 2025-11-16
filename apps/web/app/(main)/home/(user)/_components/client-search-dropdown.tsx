'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

import MultiSelect, { MultiSelectOption } from '~/components/ui/multi-select';
import { getClientsOrganizations } from '~/team-accounts/src/server/actions/clients/get/get-clients';

import Avatar from '../../../../components/ui/avatar';

// Custom item component to display client with avatar
const ClientItem = ({ option }: { option: MultiSelectOption }) => {
  return (
    <div className="flex items-center">
      <Avatar
        src={option.picture_url ?? ''}
        alt={option.label}
        username={option.label}
        className="mr-2 h-6 w-6"
      />
      <span className="text-sm">{option.label}</span>
    </div>
  );
};

export function ClientSearchDropdown() {
  const { pinned_organizations, updateOrganizationSetting } =
    useOrganizationSettings();

  // Parse pinned organizations from string to array
  const pinnedOrganizationsArray = pinned_organizations
    ? (JSON.parse(pinned_organizations) as string[])
    : [];

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clientOrganizations'],
    queryFn: async () => await getClientsOrganizations(),
  });

  // Transform clients to options format with picture_url
  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
    picture_url: client.picture_url,
  }));

  // Handle submission when the popover closes
  const handleSubmit = (values: string[]) => {
    updateOrganizationSetting.mutate({
      key: 'pinned_organizations',
      value: JSON.stringify(values),
    });
  };

  return (
    <MultiSelect
      options={clientOptions}
      selectedValues={pinnedOrganizationsArray}
      onChange={handleSubmit} // Use the same handler for both onChange and onSubmit
      isLoading={isLoading}
      customItem={ClientItem}
      customTrigger={
        <Plus className="mr-1 h-4 w-4 transition-all duration-300 hover:text-black" />
      }
      placeholder="Search clients..."
      emptyMessage="No clients found"
    />
  );
}
