import TaskDropdown from './task-dropdown';
import { AgencyStatus } from '~/lib/agency-statuses.types';
const TasksSection = ({
  userRole,
  orderId,
  orderAgencyId,
  agencyStatuses,
}: {
  userRole: string;
  orderId: string;
  orderAgencyId: string;
  agencyStatuses: AgencyStatus.Type[];
}) => {
  return (
    <div className="max-h-screen h-full overflow-y-auto">
      <TaskDropdown userRole={userRole} orderId={orderId} orderAgencyId={orderAgencyId} agencyStatuses={agencyStatuses} />
    </div>
  );
};

export default TasksSection;
