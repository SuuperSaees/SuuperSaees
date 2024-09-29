'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getOrderAgencyMembers, getAgencyClients} from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';
import DatePicker from 'node_modules/@kit/team-accounts/src/server/actions/orders/pick-date/pick-date';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Order } from '~/lib/order.types';
import { updateOrder, updateOrderAssigns, updateOrderFollowers } from '../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import ActivityAssignations from './activity-assignations';
import ActivityFollowers from './activity-followers';
import { CalendarIcon, Loader, FlagIcon } from 'lucide-react';
// import { ReviewDialog } from './review-dialog';
import AvatarDisplayer from './ui/avatar-displayer';
import SelectAction from './ui/select-action';
import { useRouter } from 'next/navigation';
import { Trans } from '@kit/ui/trans';
import { useActivityContext } from '../context/activity-context';
interface AsideOrderInformationProps {
  order: Order.Type;
  className?: string;
  [key: string]: unknown;
}
const AsideOrderInformation = ({
  order,
  className,
  ...rest
}: AsideOrderInformationProps) => {
  const { t } = useTranslation('orders');
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [selectedPriority, setSelectedPriority] = useState(order.priority);

  const router = useRouter();
  const { userRole } = useActivityContext();

  const changeStatus = useMutation({
    mutationFn: async (status: Order.Type['status']) => {
      setSelectedStatus(status);
      await updateOrder(order.id, { status });
      return router.push(`/orders/${order.id}`);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Status updated successfully!',
      });
    },
    onError: () => {
      setSelectedStatus(order.status);
      toast.error('Error', {
        description: 'The status could not be updated.',
      });
    },
  });

  const changePriority = useMutation({
    mutationFn: async (priority: Order.Type['priority']) => {
      setSelectedPriority(priority);
      await updateOrder(order.id, { priority });
      return router.push(`/orders/${order.id}`);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Priority updated successfully!',
      });
    },
    onError: () => {
      setSelectedPriority(order.priority);
      toast.error('Error', {
        description: 'The priority could not be updated.',
      });
    },
  });

  const changeDate = useMutation({
    mutationFn: async (due_date: Order.Type['due_date']) => {
      await updateOrder(order.id, { due_date });
      return router.push(`/orders/${order.id}`);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Date updated successfully!',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The date could not be updated.',
      });
    },
  });

  const changeAgencyMembersAssigned = useMutation({
    mutationFn: (agencyMemberIds: string[]) => {
      return updateOrderAssigns(order.id, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Agency members updated successfully!',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The agency members could not be updated.',
      });
    },
  });

  const changeAgencyMembersFollowers = useMutation({
    mutationFn: (agencyMemberIds: string[]) => {
      return updateOrderFollowers(order.id, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Clients followers updated successfully!',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The clients followers could not be updated.',
      });
    },
  });

  const { data: orderAgencyMembers } = useQuery({
    queryKey: ['order-agency-members', order.id],
    queryFn: () => getOrderAgencyMembers(order.agency_id, order.id),
    retry: 5,
  });

  const { data: orderAgencyClientsFollowers } = useQuery({
    queryKey: ['order-agency-clients-followers', order.id],
    queryFn: () => getAgencyClients(order.agency_id, order.id),
    retry: 5,
  });

  const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
  const priorities = ['low', 'medium', 'high'];

  const statusOptions = statuses.map((status) => {
    const camelCaseStatus = status.replace(/_./g, (match) =>
      match.charAt(1).toUpperCase(),
    );
    return {
      value: status,
      label: t(`details.statuses.${camelCaseStatus}`)
        .replace(/_/g, ' ') 
        .replace(/^\w/, (c) => c.toUpperCase()),
    };
  });

  const priorityOptions = priorities.map((priority) => ({
    value: priority,
    label: t(`details.priorities.${priority}`)
      .replace(/_/g, ' ') 
      .replace(/^\w/, (c) => c.toUpperCase()),
  }));

  const searchUserOptions =
    orderAgencyMembers?.map((user) => ({
      picture_url: user.picture_url,
      value: user.id,
      label: user.name,
    })) ?? [];

  const searchUserOptionsFollowers =
    orderAgencyClientsFollowers?.map((user) => ({
      picture_url: user.picture_url,
      value: user.id,
      label: user.name,
    })) ?? [];

  return (
    <div
      className={`flex h-[90vh] w-full min-w-0 max-w-80 relative bottom-10 border-gray-200 border-l border-t-0 border-r-0 border-b-0 pl-4 shrink-0 flex-col gap-4 text-gray-700 ${className}`}
      {...rest}
    >
      <div className="border-b border-gray-200 pb-7">
        <h3 className="font-bold pb-4"><Trans i18nKey="details.createdBy" /></h3>
        <AvatarDisplayer
          displayName={order.client ? order.client?.name : undefined}
          pictureUrl={
            order.client
              ? order.client?.picture_url && order.client?.picture_url
              : undefined
          }
          // status="online"
        />
      </div>
      <h3 className="font-bold">{t('details.summary')}</h3>

      
      {['agency_member', 'agency_owner', 'agency_project_manager'].includes(userRole) ? (
        <>
        <div className="flex justify-between items-center">
            <span className="text-sm font-semibold flex"><CalendarIcon className="mr-2 h-4 w-4" />  {t('details.deadline')} </span>
            <DatePicker updateFn={changeDate.mutate} defaultDate={order.due_date} />
          </div>
          <div className="flex text-sm items-center">
          <Loader className="mr-2 h-4 w-4" />
          <SelectAction
            options={statusOptions}
            groupName={t('details.status')}
            defaultValue={selectedStatus}
            className={selectedStatus ? statusColors[selectedStatus] : undefined}
            onSelectHandler={(status) => {
              changeStatus.mutate(status as Order.Type['status']);
            }}
            disabled={changeStatus.isPending}
          />
          </div>
          <div className="flex text-sm items-center">
            <FlagIcon className="mr-2 h-4 w-4" />
            <SelectAction
              options={priorityOptions}
              groupName={t('details.priority')}
              defaultValue={selectedPriority}
              className={
                selectedPriority ? priorityColors[selectedPriority] : undefined
              }
              onSelectHandler={(priority) => {
                changePriority.mutate(priority as Order.Type['priority']);
              }}
              disabled={changePriority.isPending}
            />
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

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold flex"><CalendarIcon className="mr-2 h-4 w-4" />  {t('details.deadline')} </span>
            <span className="pl-2 pr-2">
            {order.due_date
              ? new Date(order.due_date).toLocaleDateString()
              : <Trans i18nKey="orders:details.deadlineNotSet" />}
          </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex">
            <Loader className="mr-2 h-4 w-4" />
            <span className="font-semibold">{t('details.status')}</span>
            </div>
            <span className={`px-2 py-1 rounded-full font-semibold ${order.status ? statusColors[order.status] : undefined}`}>
              {order.status
                ?.replace(/_/g, ' ')
                .replace(/^\w/, (c) => c.toUpperCase())}
            </span>
          </div>

          <div className="flex justify-between items-center mb-4">
           <div className="flex">
           <FlagIcon className="mr-2 h-4 w-4" />
           <span className="font-semibold">{t('details.priority')}</span>
           </div>
            <span className={`px-2 py-1 flex items-center rounded-full font-semibold ${order.priority ? priorityColors[order.priority] : undefined}`}>
            <div className='h-2 w-2 mr-2 rounded-full bg-current'></div>
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
  );
};

// IMPORTANT: don't add any more functionalities to this component
// IMPORTANT: Modularize this component to be able to reuse it in the chat component

export default AsideOrderInformation;