import { Trans } from '@kit/ui/trans';

interface PageHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
}

export function PageHeader({ title, rightContent }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between h-9">
      <h2 className="font-inter text-xl font-medium leading-4">
        <Trans i18nKey={title} />
      </h2>
      {rightContent}
    </div>
  );
}
