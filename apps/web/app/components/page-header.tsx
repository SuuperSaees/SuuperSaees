import { Header } from "./header";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader = ({ title, children, className }: PageHeaderProps) => {
  return (
    <Header.Root title={title} className={className}>
      {children}
      <Header.Right />
    </Header.Root>
  );
};

export { PageHeader };
