import { Header } from "./header";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  rightContent?: React.ReactNode;
}

const PageHeader = ({
  title,
  children,
  className,
  rightContent,
}: PageHeaderProps) => {
  return (
    <Header.Root title={title} className={className}>
      {children}
      <Header.Right>{rightContent}</Header.Right>
    </Header.Root>
  );
};

export { PageHeader };
