'use client';

import { Flag, SquareKanban, Tag, Users2 } from 'lucide-react';

import { Account } from '~/lib/account.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Tags } from '~/lib/tags.types';
import { User } from '~/lib/user.types';
import { formatString } from '~/utils/text-formatter';

import { FilterGroup, FilterOption } from '../components/filters';
import { TabConfig } from '../components/status-filters';
import { useOrdersContext } from '../components/context/orders-context';

// Types
interface Priority {
  id: string;
  name: string;
  color?: string;
}

interface UseOrdersFilterConfigsProps {
  tags: Tags.Type[];
  statuses: AgencyStatus.Type[];
  agencyMembers: User.Response[];
  clientMembers: User.Response[];
  clientOrganizations: Account.Response[];
  priorities: Priority[];
}

// Constants
const STATUS_FILTERS = {
  OPEN: [] as string[], // Will be populated dynamically based on available statuses
  COMPLETED: [] as string[], // Will be populated dynamically based on available statuses
};

const useOrdersFilterConfigs = ({
  tags,
  statuses,
  agencyMembers,
  priorities,
  clientMembers,
  clientOrganizations,
}: UseOrdersFilterConfigsProps) => {
  const { updateFilters, resetFilters, getFilterValues } = useOrdersContext();

  // Populate STATUS_FILTERS dynamically based on available statuses
  const openStatusIds = statuses
    .filter(status => 
      status.status_name && 
      !['completed', 'anulled'].includes(status.status_name)
    )
    .map(status => status.id.toString());
    
  const completedStatusIds = statuses
    .filter(status => status.status_name === 'completed')
    .map(status => status.id.toString());

  STATUS_FILTERS.OPEN = openStatusIds;
  STATUS_FILTERS.COMPLETED = completedStatusIds;

  // Get current filter values from context
  const filters = {
    status: getFilterValues('status'),
    tags: getFilterValues('tags'),
    priority: getFilterValues('priority'),
    assigned_to: getFilterValues('assigned_to'),
    client_organization: getFilterValues('client_organization'),
    customer: getFilterValues('customer'),
  };

  // Helper function to toggle filter value
  const toggleFilterValue = (filterKey: string, value: string) => {
    const currentValues = getFilterValues(filterKey);
    const hasValue = currentValues.includes(value);
    
    let newValues: string[];
    if (hasValue) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    // Update all filters with the new value for this key
    const allFilters = {
      status: getFilterValues('status'),
      tags: getFilterValues('tags'),
      priority: getFilterValues('priority'),
      assigned_to: getFilterValues('assigned_to'),
      client_organization: getFilterValues('client_organization'),
      customer: getFilterValues('customer'),
    };
    
    allFilters[filterKey as keyof typeof allFilters] = newValues;
    
    // Remove empty filter arrays
    const cleanedFilters = Object.fromEntries(
      Object.entries(allFilters).filter(([_, values]) => values.length > 0)
    );
    
    updateFilters(cleanedFilters);
  };

  // Helper function to replace filter values
  const replaceFilterValues = (filterKey: string, values: string[]) => {
    const allFilters = {
      status: getFilterValues('status'),
      tags: getFilterValues('tags'),
      priority: getFilterValues('priority'),
      assigned_to: getFilterValues('assigned_to'),
      client_organization: getFilterValues('client_organization'),
      customer: getFilterValues('customer'),
    };
    
    if (values.length > 0) {
      allFilters[filterKey as keyof typeof allFilters] = values;
    } else {
      delete allFilters[filterKey as keyof typeof allFilters];
    }
    
    // Remove empty filter arrays
    const cleanedFilters = Object.fromEntries(
      Object.entries(allFilters).filter(([_, filterValues]) => filterValues.length > 0)
    );
    
    updateFilters(cleanedFilters);
  };

  // Utility functions
  const account = {
    stringify: (user: User.Response | Account.Response) =>
      JSON.stringify({
        id: user?.id,
        name: user.name ?? '',
        picture_url: user.picture_url ?? '',
      }),
  };

  // Filter Option Generators
  const generateStatusOptions = (
    statuses: AgencyStatus.Type[],
  ): FilterOption[] =>
    statuses.map((status) => ({
      label: formatString(status?.status_name ?? '', 'capitalize') ?? '',
      value: status.id.toString(),
      color: status?.status_color ?? '',
      onFilter: () =>
        toggleFilterValue('status', status.id.toString()),
    }));

  const generateTagOptions = (tags: Tags.Type[]): FilterOption[] =>
    tags.map((tag) => ({
      label: tag.name,
      value: tag.id,
      color: tag.color ?? '',
      onFilter: () =>
        toggleFilterValue('tags', tag.id),
    }));

  const generatePriorityOptions = (priorities: Priority[]): FilterOption[] =>
    priorities.map((priority) => ({
      label: formatString(priority.name, 'capitalize'),
      value: priority.name,
      color: priority.color,
      onFilter: () =>
        toggleFilterValue('priority', priority.name ?? ''),
    }));

  const generateUserOptions = (members: User.Response[]): FilterOption[] =>
    members.map((member) => ({
      label: account.stringify(member),
      value: member.id,
      onFilter: () =>
        toggleFilterValue('assigned_to', member.id),
    }));

  const generateClientOrganizationOptions = (
    clientOrganizations: Account.Response[],
  ): FilterOption[] =>
    clientOrganizations.map((clientOrganization) => ({
      label: account.stringify(clientOrganization),
      value: clientOrganization.id,
      onFilter: () =>
        toggleFilterValue('client_organization', clientOrganization.id),
    }));

  const generateCustomerOptions = (
    customers: User.Response[],
  ): FilterOption[] =>
    customers.map((customer) => ({
      label: account.stringify(customer),
      value: customer.id,
      onFilter: () =>
        toggleFilterValue('customer', customer.id),
    }));

  const filtersConfig: FilterGroup[] = [
    {
      key: 'status',
      type: 'multiple-choice',
      title: 'Status',
      icon: SquareKanban,
      options: generateStatusOptions(statuses),
    },
    {
      key: 'tags',
      type: 'multiple-choice',
      title: 'Tags',
      icon: Tag,
      options: generateTagOptions(tags),
    },
    {
      key: 'priority',
      type: 'multiple-choice',
      title: 'Priority',
      icon: Flag,
      options: generatePriorityOptions(priorities),
    },
    {
      key: 'assigned_to',
      type: 'users',
      title: 'Assigned to',
      icon: Users2,
      options: generateUserOptions(agencyMembers),
    },
    {
      key: 'client_organization',
      type: 'users',
      title: 'Client organization',
      icon: Users2,
      options: generateClientOrganizationOptions(clientOrganizations),
    },
    {
      key: 'customer',
      type: 'users',
      title: 'Customer',
      icon: Users2,
      options: generateCustomerOptions(clientMembers),
    },
  ];

  const tabsConfig: TabConfig[] = [
    {
      key: 'open',
      label: 'openOrders',
      filter: () => replaceFilterValues('status', STATUS_FILTERS.OPEN),
    },
    {
      key: 'completed',
      label: 'completedOrders',
      filter: ()  =>
        replaceFilterValues('status', STATUS_FILTERS.COMPLETED),
    },
    {
      key: 'all',
      label: 'allOrders',
      filter: () => resetFilters(),
    },
  ];

  return {
    filters,
    filtersConfig,
    tabsConfig,
    getFilterValues,
    resetFilters,
    updateFilters,
  };
};

export default useOrdersFilterConfigs;
