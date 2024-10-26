import { useRealTimeTasks } from '../hooks/use-tasks';
import TaskDropdown from './task-dropdown';

const TasksSection = ({
  userRole,
  orderId,
}: {
  userRole: string;
  orderId: string;
}) => {
  const { tasks } = useRealTimeTasks(orderId);

  return (
    <div className="h-screen max-h-screen overflow-y-auto">
      <TaskDropdown tasks={tasks} userRole={userRole} orderId={orderId} />
    </div>
  );
};

export default TasksSection;
