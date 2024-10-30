import TaskDropdown from './task-dropdown';

const TasksSection = ({
  userRole,
  orderId,
}: {
  userRole: string;
  orderId: string;
}) => {

  return (
    <div className="h-screen max-h-screen overflow-y-auto">
      <TaskDropdown userRole={userRole} orderId={orderId} />
    </div>
  );
};

export default TasksSection;
