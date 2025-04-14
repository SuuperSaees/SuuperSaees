import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb as BreadcrumbProvider,
  BreadcrumbSeparator,
} from '@kit/ui/breadcrumb';

export type BreadcrumbItem = {
  id: string;
  title: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
};
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  handlePathClick: (index: number) => void;
}

const Breadcrumb = ({ items, handlePathClick }: BreadcrumbProps) => {
  return (
    <BreadcrumbProvider>
      <BreadcrumbList>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <BreadcrumbItem key={item.id ?? index} className='text-gray-500 hover:text-gray-700'>
              {Icon && <Icon className="h-4 w-4" />}
              {index === items.length - 1 ? (
                <BreadcrumbPage className="font-medium text-gray-700">
                  {item.title}
                </BreadcrumbPage>
              ) : (
                <span
                  className={
                    index === items.length - 1
                      ? 'cursor-default text-gray-500'
                      : 'cursor-pointer'
                  }
                  onClick={() =>
                    index !== items.length - 1 && handlePathClick(index)
                  }
                >
                  {item.title}
                </span>
              )}

              {index !== items.length - 1 && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbProvider>
  );
};

export default Breadcrumb;
