'use client';
interface InputCardProps {
  name: string;
  icon: JSX.Element;
  action?: () => void;
}
export default function InputCard({ name, icon, action }: InputCardProps) {
  return (
    <div
      className="flex h-auto w-full max-w-32 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-gray-300 p-8 transition-all duration-200 hover:border-primary-500 hover:shadow-md"
      onClick={action}
    >
      {icon}
      <span className="text-xs font-bold">{name}</span>
    </div>
  );
}
