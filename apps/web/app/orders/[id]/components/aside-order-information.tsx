'use client';

// import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarIcon, FlagIcon, Loader } from 'lucide-react';
import {
  getOrderAgencyMembers,
} from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';
import DatePicker from 'node_modules/@kit/team-accounts/src/server/actions/orders/pick-date/pick-date';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { formatDisplayDate } from '@kit/shared/utils';
import { Trans } from '@kit/ui/trans';

import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';

import {
  updateOrder,
  updateOrderAssigns,
  updateOrderFollowers,
} from '../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import { AgencyStatusesProvider } from '../../components/context/agency-statuses-context';
import { useActivityContext } from '../context/activity-context';
import deduceNameFromEmail from '../utils/deduce-name-from-email';
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import ActivityAssignations from './activity-assignations';
import ActivityFollowers from './activity-followers';
// import SelectAction from './ui/select-action';
import StatusCombobox from './status-combobox';
// import { ReviewDialog } from './review-dialog';
import AvatarDisplayer from './ui/avatar-displayer';
// import SelectAction from './ui/select-action';
import { PriorityCombobox } from './priority-combobox';
import { getClientMembersForOrganization } from '~/team-accounts/src/server/actions/clients/get/get-clients';

interface AsideOrderInformationProps {
  order: Order.Relational;
  className?: string;
  [key: string]: unknown;
  agencyStatuses: AgencyStatus.Type[];
}
const AsideOrderInformation = ({
  order,
  className,
  agencyStatuses,
  ...rest
}: AsideOrderInformationProps) => {
  const { t, i18n } = useTranslation(['orders', 'responses']);
  // const [selectedStatus, setSelectedStatus] = useState(order.status);
  // const [selectedPriority, setSelectedPriority] = useState(order.priority);
  const language = i18n.language;
  const router = useRouter();
  const { userRole } = useActivityContext();

  // const changeStatus = useMutation({
  //   mutationFn: async (status: Order.Type['status']) => {
  //     setSelectedStatus(status);
  //     await updateOrder(order.id, { status });
  //     return router.push(`/orders/${order.id}`);
  //   },
  //   onSuccess: () => {
  //     toast.success('Success', {
  //       description: t('success.orders.orderStatusUpdated'),
  //     });
  //   },
  //   onError: () => {
  //     setSelectedStatus(order.status);
  //     toast.error('Error', {
  //       description: t('error.orders.failedToUpdateOrderStatus'),
  //     });
  //   },
  // });

  // const changePriority = useMutation({
  //   mutationFn: async (priority: Order.Type['priority']) => {
  //     setSelectedPriority(priority);
  //     await updateOrder(order.id, { priority });
  //     return router.push(`/orders/${order.id}`);
  //   },
  //   onSuccess: () => {
  //     toast.success('Success', {
  //       description: t('success.orders.orderPriorityUpdated'),
  //     });
  //   },
  //   onError: () => {
  //     setSelectedPriority(order.priority);
  //     toast.error('Error', {
  //       description: t('error.orders.failedToUpdateOrderPriority'),
  //     });
  //   },
  // });

  const changeDate = useMutation({
    mutationFn: async (due_date: Order.Type['due_date']) => {
      await updateOrder(order.id, { due_date });
      return router.push(`/orders/${order.id}`);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: t('success.orders.orderDateUpdated'),
      });
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderDate'),
      });
    },
  });

  const changeAgencyMembersAssigned = useMutation({
    mutationFn: (agencyMemberIds: string[]) => {
      return updateOrderAssigns(order.id, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: t('success.orders.orderAssigneesUpdated'),
      });
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderAssigneees'),
      });
    },
  });

  const changeAgencyMembersFollowers = useMutation({
    mutationFn: (agencyMemberIds: string[]) => {
      return updateOrderFollowers(order.id, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: t('success.orders.orderFollowersUpdated'),
      });
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderFollowers'),
      });
    },
  });

  const { data: orderAgencyMembers } = useQuery({
    queryKey: ['order-agency-members', order.id],
    queryFn: () => getOrderAgencyMembers(order.agency_id, order.id),
    retry: 5,
    enabled:
      userRole === 'agency_owner' ||
      userRole === 'agency_member' ||
      userRole === 'agency_project_manager',
  });

  const { data: orderAgencyClientsFollowers } = useQuery({
    queryKey: ['order-agency-clients-followers', order.id],
    queryFn: () => getClientMembersForOrganization(order.client_organization_id),
    retry: 5,
    enabled:
      userRole === 'agency_owner' ||
      userRole === 'agency_member' ||
      userRole === 'agency_project_manager',
  });

  // const { data: orderAgencyClientsFollowers } = useQuery({
  //   queryKey: ['order-agency-clients-followers', order.id],
  //   queryFn: () => getAgencyClients(order.agency_id, order.id),
  //   retry: 5,
  // });

  // const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
  // const priorities = ['low', 'medium', 'high'];

  // const statusOptions = statuses.map((status) => {
  //   const camelCaseStatus = status.replace(/_./g, (match) =>
  //     match.charAt(1).toUpperCase(),
  //   );
  //   return {
  //     value: status,
  //     label: t(`details.statuses.${camelCaseStatus}`)
  //       .replace(/_/g, ' ')
  //       .replace(/^\w/, (c) => c.toUpperCase()),
  //   };
  // });

  // const getStatusClassName = (status: string) =>
  //   statusColors[
  //     status as 'pending' | 'in_progress' | 'completed' | 'in_review'
  //   ] ?? '';

  // const priorityOptions = priorities.map((priority) => ({
  //   value: priority,
  //   label: t(`details.priorities.${priority}`)
  //     .replace(/_/g, ' ')
  //     .replace(/^\w/, (c) => c.toUpperCase()),
  // }));

  // const getPriorityClassName = (priority: string) =>
  //   priorityColors[priority as 'low' | 'medium' | 'high'] ?? '';

  const searchUserOptions =
    orderAgencyMembers?.map((user) => ({
      picture_url: user?.user_settings?.picture_url ?? user.picture_url ?? '',
      value: user.id,
      label: user?.user_settings?.name ?? user.name ?? '',
    })) ?? [];

  const searchUserOptionsFollowers =
    orderAgencyClientsFollowers?.map((user) => ({
      picture_url: user?.settings?.picture_url?? user?.picture_url ?? '',
      value: user.id,
      label: user?.settings?.name ?? user.name ?? '',
    })) ?? [];

  const userRoles = new Set([
    'agency_member',
    'agency_owner',
    'agency_project_manager',
  ]);

  return (
    <AgencyStatusesProvider initialStatuses={agencyStatuses}>
      <div
        className={`no-scrollbar relative flex h-full min-h-full w-full min-w-0 max-w-80 shrink-0 flex-col gap-4 overflow-y-auto border-b-0 border-l border-r-0 border-t-0 border-gray-200 pl-4 pr-1 pt-4 text-gray-700 ${className}`}
        {...rest}
      >
        <div className="border-b border-gray-200 pb-7">
          <h3 className="pb-4 font-bold">
            <Trans i18nKey="details.createdBy" />
          </h3>
          <div className="flex gap-3">
            <AvatarDisplayer
              displayName={
                order.client?.settings?.name ?? order.client?.name
              }
              pictureUrl={
                order.client?.settings?.picture_url ?? order.client?.picture_url
              }
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                {order.client?.settings?.name ?? order.client?.name ?? ''}
              </span>
              <span className="text-sm text-gray-600">
                {order.client_organization?.name
                  ? order.client_organization?.name
                  : ''}
              </span>
            </div>
          </div>
        </div>

        <h3 className="font-medium">{t('details.summary')}</h3>

        {userRoles.has(userRole) ? (
          <>
            <div className="flex items-center justify-between">
              <span className="flex text-sm font-semibold">
                <CalendarIcon className="mr-2 h-4 w-4" />{' '}
                {t('details.deadline')}{' '}
              </span>
              <DatePicker
                updateFn={changeDate.mutate}
                defaultDate={order.due_date}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-[0.20rem] font-semibold">
                <Loader className="mr-2 h-4 w-4" />
                <p>{t('details.status')}</p>
              </div>

              <StatusCombobox
                order={order}
                agency_id={order.agency_id}
                mode="order"
              />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <FlagIcon className="mr-2 h-4 w-4" />
                <span className="font-semibold">{t('details.priority')}</span>
              </div>
              <PriorityCombobox order={order} mode={'order'} />
            </div>
            <ActivityAssignations
              searchUserOptions={searchUserOptions}
              assignedTo={order.assigned_to}
              updateFunction={changeAgencyMembersAssigned.mutate}
            />

            <ActivityFollowers
              searchUserOptions={searchUserOptionsFollowers}
              followers={order.followers}
              updateFunction={changeAgencyMembersFollowers.mutate}
            />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex text-sm font-semibold">
                <CalendarIcon className="mr-2 h-4 w-4" />{' '}
                {t('details.deadline')}{' '}
              </span>
              <span className="pl-2 pr-2">
                {order.due_date ? (
                  formatDisplayDate(new Date(order.due_date), language)
                ) : (
                  <Trans i18nKey="orders:details.deadlineNotSet" />
                )}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex">
                <Loader className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">
                  {t('details.status')}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-1 ${order.status ? statusColors[order.status] : undefined}`}
              >
                {order.status
                  ?.replace(/_/g, ' ')
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </span>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex">
                <FlagIcon className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">
                  {t('details.priority')}
                </span>
              </div>
              <span
                className={`flex items-center rounded-full px-2 py-1 ${order.priority ? priorityColors[order.priority] : undefined}`}
              >
                <div className="mr-2 h-2 w-2 rounded-full bg-current"></div>
                {order.priority
                  ?.replace(/_/g, ' ')
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </span>
            </div>

            <ActivityAssignations
              searchUserOptions={searchUserOptions}
              assignedTo={order.assigned_to}
              updateFunction={changeAgencyMembersAssigned.mutate}
            />

            <ActivityFollowers
              searchUserOptions={searchUserOptionsFollowers}
              followers={order.followers}
              updateFunction={changeAgencyMembersFollowers.mutate}
            />
          </div>
        )}

      </div>
    </AgencyStatusesProvider>
  );
};

// IMPORTANT: don't add any more functionalities to this component
// IMPORTANT: Modularize this component to be able to reuse it in the chat component

export default AsideOrderInformation;
