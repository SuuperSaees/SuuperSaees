import { useEffect } from 'react';

import { Spinner } from '@kit/ui/spinner';

import { getTasks } from '~/team-accounts/src/server/actions/tasks/get/get-tasks';

import { useRealTimeTasks } from '../hooks/use-tasks';
import TaskDropdown from './task-dropdown';

const TasksSection = ({
  userRole,
  orderId,
}: {
  userRole: string;
  orderId: string;
}) => {
  const { tasks, setTasks, loading, setLoading } = useRealTimeTasks();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await getTasks(orderId);
        setTasks(tasksData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks().catch((error) => console.error(error));
  }, [orderId, setTasks, setLoading]);

  return (
    <>
      {loading ? <Spinner className="mx-auto mt-10" /> : null}
      <div className="h-screen max-h-screen overflow-y-auto">
        <TaskDropdown tasks={tasks} userRole={userRole} orderId={orderId} />
      </div>
    </>
  );
};

export default TasksSection;
