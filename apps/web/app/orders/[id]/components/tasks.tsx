import TaskDropdown from './task-dropdown';

const TasksSection = ({
  userRole,
  orderId,
  orderAgencyId,
}: {
  userRole: string;
  orderId: string;
  orderAgencyId: string;
}) => {

  return (
    <div className="h-screen max-h-screen overflow-y-auto">
      <TaskDropdown userRole={userRole} orderId={orderId} orderAgencyId={orderAgencyId} />
    </div>
  );
};

export default TasksSection;
