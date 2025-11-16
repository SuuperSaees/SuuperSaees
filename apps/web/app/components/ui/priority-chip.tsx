interface PriorityButtonProps {
  priority: string;
  className?: string;
  action?: (priority: string | number) => Promise<void> | void;
}

export const PriorityChip = ({ priority, action, className }: PriorityButtonProps) => {
  return (
    <div
      className={`ml-auto flex items-center gap-1 rounded-full px-2 py-1 ${className}`}
      onClick={(action) ? () => action(priority) : undefined}
    >
      <div className="h-1 w-1 rounded-full bg-current" />
      <small className="text-xs font-semibold capitalize">{priority}</small>
    </div>
  );
};

export default PriorityChip;
