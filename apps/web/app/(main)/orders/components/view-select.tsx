import { LucideIcon } from 'lucide-react';

import SelectAction, { Option } from '../../../components/ui/select';

interface IconOption extends Option {
  icon: LucideIcon;
}
interface ViewSelectProps {
  options: IconOption[];
  defaultValue?: string;
  className?: string;
  [key: string]: unknown;
}

interface CustomItemProps {
  label: string;
  icon?: LucideIcon;
}

const ViewSelect = ({
  options,
  defaultValue,
  className,
  ...rest
}: ViewSelectProps) => {
  return (
    <SelectAction
      options={options as unknown as Option[]}
      defaultValue={defaultValue}
      containerClassname="block"
      className={
        'w-fit border border-gray-200 bg-white text-gray-600 ' +
        className
      }
      {...rest}
      customItem={(option: string) => (
        <CustomItem
          label={option}
          icon={options.find((opt) => opt.label === option)?.icon}
        />
      )}
    />
  );
};

const CustomItem = ({ label, icon: Icon }: CustomItemProps) => {
  return (
    <div className="flex w-full items-center gap-2 rounded-full bg-white/70 px-2 py-1 font-semibold capitalize text-gray-600">
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </div>
  );
};

export default ViewSelect;
