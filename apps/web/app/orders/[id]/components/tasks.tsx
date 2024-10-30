import TaskDropdown from './task-dropdown';

const TasksSection = ({
  userRole,
  orderId,
}: {
  userRole: string;
  orderId: string;
}) => {

  return (
<<<<<<< Updated upstream
    <div className="h-screen max-h-screen overflow-y-auto">
      <TaskDropdown userRole={userRole} orderId={orderId} />
=======
    <div className="h-[76vh] overflow-hidden overflow-y-auto no-scrollbar">
      <TaskDropdown tasks={tasks} userRole={userRole} orderId={orderId} />
>>>>>>> Stashed changes
    </div>
  );
};

export default TasksSection;
