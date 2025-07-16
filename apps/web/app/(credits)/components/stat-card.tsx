import { cn } from "@kit/ui/utils";

export interface CreditStatCardProps {
  title: React.ReactNode | string;
  value: number;
  className?: string;
}

const CreditStatCard = ({ title, value, className }: CreditStatCardProps) => {
  return (
    <div
      className={cn(
        "border border-gray-200 rounded-md p-4 flex flex-col gap-4",
        "min-w-72 w-full flex-1",
        className
      )}
    >
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-4xl font-medium">{value}</p>
    </div>
  );
};

export default CreditStatCard;
