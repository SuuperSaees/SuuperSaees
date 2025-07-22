import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

interface PageHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  rightContent,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('flex h-9 items-center justify-between', className)}>
      {!children && (
        <h2 className="font-inter text-xl font-medium leading-4">
          <Trans i18nKey={title} />
        </h2>
      )}
      {children}
      <div className="flex items-center gap-2 ml-2">
        {rightContent}
      </div>
    </div>
  );
}
