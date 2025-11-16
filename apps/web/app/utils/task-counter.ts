import { Task } from '~/lib/tasks.types';

export const countIncompleteTasks = (tasks: Task.Type[]) => {
  let count = 0;

  tasks.forEach((task) => {
    if (!task.completed && task.deleted_on === null) {
      count++;
    }
  });

  return count;
};


export const calculateSubtaskProgress = (subtasks: Task.Type['subtasks']) => {
  const totalSubtasks = subtasks?.length ?? 0;
  const completedSubtasks = subtasks?.filter((subtask) => subtask.completed).length ?? 0;

  // Calculamos el porcentaje de progreso basado en subtareas completadas
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  return progress;
};
