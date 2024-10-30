import TaskDropdown from './task-dropdown';

const TasksSection = ({
  userRole,
  orderId,
}: {
  userRole: string;
  orderId: string;
}) => {
  return (
    <div className="no-scrollbar h-[76vh] overflow-hidden overflow-y-auto">
      <TaskDropdown userRole={userRole} orderId={orderId} />
    </div>
  );
};

export default TasksSection;
