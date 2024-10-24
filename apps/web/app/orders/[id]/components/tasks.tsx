import { Task } from "~/lib/tasks.types";
import TaskDropdown from "./task-dropdown";

const TasksSection = (
  { tasks }: { tasks: Task.Type[] }
) => {

  return (
    <div className="h-screen max-h-screen overflow-y-auto">
      <TaskDropdown  tasks={tasks}/>
    </div>
  );
};

export default TasksSection;