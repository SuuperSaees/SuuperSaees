import { PageTitle } from "./page-title";

interface PageHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
}
  
export function PageHeader({ title, rightContent }: PageHeaderProps) {
  return (
    <div className="mb-[36px] flex items-center justify-between">
      <div className="flex w-full justify-between">
        <PageTitle i18nKey={title} />
        {rightContent}
      </div>
    </div>
  );
}