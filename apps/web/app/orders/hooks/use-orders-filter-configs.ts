'use client';

import { Flag, SquareKanban, Tag, Users2 } from 'lucide-react';

import useFilters from '~/hooks/use-filters';
import { Account } from '~/lib/account.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';
import { Tags } from '~/lib/tags.types';
import { User } from '~/lib/user.types';
import { formatString } from '~/utils/text-formatter';

import { FilterGroup, FilterOption } from '../components/filters';
import { TabConfig } from '../components/status-filters';

// Types
interface Priority {
  id: string;
  name: string;
  color?: string;
}

interface FilterHandler {
  key: string;
  filterFn: (order: Order.Response, selectedValues: string[]) => boolean;
  persistent?: boolean;
}

interface UseOrdersFilterConfigsProps {
  orders: Order.Response[];
  tags: Tags.Type[];
  statuses: AgencyStatus.Type[];
  agencyMembers: User.Response[];
  clientMembers: User.Response[];
  clientOrganizations: Account.Response[];
  priorities: Priority[];
  storageKey: string;
}

// Constants
const STATUS_FILTERS = {
  OPEN: (order: Order.Response) =>
    order.status !== 'completed' && order.status !== 'anulled',
  COMPLETED: (order: Order.Response) => order.status === 'completed',
};

const normalizeString = (str: string | undefined | null) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
};

const getDateFormats = (date: Date) => [
  date.toLocaleDateString(),
  date.toLocaleDateString('es-ES'),
  date.toLocaleString('default', { month: 'short' }),
  date.toLocaleString('en-US', { month: 'short' }), 
  date.toLocaleString('default', { month: 'long' }),
  date.toLocaleString('en-US', { month: 'long' }), 
  date.getFullYear().toString()
].map(d => normalizeString(d));

const getSearchableFields = (order: Order.Response) => {
  const fields = [
    order.id?.toString().replace('#', ''),
    order.title,
    order.description,
    order.brief?.name,
    order.client_organization?.name,
    order.customer?.name,
    order.customer?.email,
    order.status?.toLowerCase(),
    order.priority?.toLowerCase(),
    ...order.assigned_to?.flatMap(assignee => [
      assignee.agency_member?.name,
      assignee.agency_member?.email
    ]) ?? []
  ];

  // Add date formats
  const dates = [
    order.created_at,
    order.updated_at,
    order.due_date
  ].filter(Boolean);

  const dateFormats = dates.flatMap(date => 
    date ? getDateFormats(new Date(date)) : []
  );

  return [...fields, ...dateFormats]
    .filter(Boolean)
    .map(normalizeString);
};

const useOrdersFilterConfigs = ({
  orders,
  tags,
  statuses,
  agencyMembers,
  priorities,
  clientMembers,
  clientOrganizations,
  storageKey = 'orders-filters',
}: UseOrdersFilterConfigsProps) => {
  const initialFiltersHandlers: FilterHandler[] = [
    {
      key: 'status',
      filterFn: (order, selectedValues) =>
        selectedValues.includes(order.status ?? ''),
    },
    {
      key: 'tags',
      filterFn: (order, selectedValues) =>
        selectedValues.some((tagId) =>
          order.tags?.map((tag) => tag.tag.id).includes(tagId),
        ),
    },
    {
      key: 'priority',
      filterFn: (order, selectedValues) =>
        selectedValues.includes(order.priority ?? ''),
    },
    {
      key: 'assigned_to',
      filterFn: (order, selectedValues) =>
        selectedValues.some((assigneeId) =>
          order.assigned_to
            ?.map((assignee) => assignee.agency_member?.id)
            .includes(assigneeId),
        ),
    },
    {
      key: 'client_organization',
      filterFn: (order, selectedValues) =>
        selectedValues.some(
          (clientOrganizationId) =>
            order.client_organization?.id === clientOrganizationId,
        ),
    },
    {
      key: 'customer',
      filterFn: (order, selectedValues) =>
        selectedValues.some((customerId) => order.customer?.id === customerId),
    },
    {
      key: 'search',
      filterFn: (order, selectedValues) =>
        selectedValues.some((searchTerm) => {
          const searchTermNormalized = normalizeString(searchTerm);
          const searchableFields = getSearchableFields(order);
          return searchableFields.some(field => field.includes(searchTermNormalized));
        }),
      persistent: false,
    },
  ];

  const {
    filteredData: filteredOrders,
    filters,
    updateFilter,
    removeFilter,
    resetFilters,
    getFilterValues,
  } = useFilters(orders, initialFiltersHandlers, storageKey);

  // Utility functions

  const account = {
    stringify: (user: User.Response) =>
      JSON.stringify({
        id: user?.id,
        name: user.settings?.name ?? user?.name ?? '',
        picture_url: user.settings?.picture_url ?? user?.picture_url ?? '',
      }),
  };
  // Filter Option Generators
  const generateStatusOptions = (
    statuses: AgencyStatus.Type[],
  ): FilterOption[] =>
    statuses.map((status) => ({
      label: formatString(status.status_name ?? '', 'capitalize') ?? '',
      value: status.status_name ?? '',
      color: status.status_color ?? '',
      onFilter: () =>
        updateFilter(
          'status',
          'toggle',
          (order) => order.status === status.status_name,
          status.status_name ?? '',
        ),
    }));

  const generateTagOptions = (tags: Tags.Type[]): FilterOption[] =>
    tags.map((tag) => ({
      label: tag.name,
      value: tag.id,
      color: tag.color ?? '',
      onFilter: () =>
        updateFilter(
          'tags',
          'toggle',
          (order) => (order.tags?.map((t) => t.tag.id) ?? []).includes(tag.id),
          tag.id,
        ),
    }));

  const generatePriorityOptions = (priorities: Priority[]): FilterOption[] =>
    priorities.map((priority) => ({
      label: formatString(priority.name, 'capitalize'),
      value: priority.name,
      color: priority.color,
      onFilter: () =>
        updateFilter(
          'priority',
          'toggle',
          (order) => order.priority === priority.name,
          priority.name ?? '',
        ),
    }));

  const generateUserOptions = (members: User.Response[]): FilterOption[] =>
    members.map((member) => ({
      label: account.stringify(member),
      value: member.id,
      onFilter: () =>
        updateFilter(
          'assigned_to',
          'toggle',
          (order) =>
            order.assigned_to
              ?.map((assignee) => assignee.agency_member?.id)
              .includes(member.id) ?? false,
          member.id,
        ),
    }));

  const generateClientOrganizationOptions = (
    clientOrganizations: Account.Response[],
  ): FilterOption[] =>
    clientOrganizations.map((clientOrganization) => ({
      label: account.stringify(clientOrganization),
      value: clientOrganization.id,
      onFilter: () =>
        updateFilter(
          'client_organization',
          'toggle',
          (order) => order.client_organization?.id === clientOrganization.id,
          clientOrganization.id,
        ),
    }));

  const generateCustomerOptions = (
    customers: User.Response[],
  ): FilterOption[] =>
    customers.map((customer) => ({
      label: account.stringify(customer),
      value: customer.id,

      onFilter: () =>
        updateFilter(
          'customer',
          'toggle',
          (order) => order.customer?.id === customer.id,
          customer.id,
        ),
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
      filter: () => updateFilter('status', 'replace', STATUS_FILTERS.OPEN),
    },
    {
      key: 'completed',
      label: 'completedOrders',
      filter: ()  =>
        updateFilter(
          'status',
          'replace',
          STATUS_FILTERS.COMPLETED,
          'completed',
        ),
    },
    {
      key: 'all',
      label: 'allOrders',
      filter: () => removeFilter('status'),
    },
  ];

  const searchConfig = {
    key: 'search',
    label: 'search',
    filter: (searchTerm: string) =>
      updateFilter(
        'search',
        'replace',
        (order: Order.Response) => {
          const searchTermNormalized = normalizeString(searchTerm);
          const searchableFields = getSearchableFields(order);
          return searchableFields.some(field => field.includes(searchTermNormalized));
        },
        searchTerm,
        false
      ),
  };

  return {
    filters,
    filtersConfig,
    tabsConfig,
    filteredOrders,
    searchConfig,
    updateFilter,
    resetFilters,
    getFilterValues,
  };
};

export default useOrdersFilterConfigs;
