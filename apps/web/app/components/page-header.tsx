import { HomeMobileNavigation } from "~/(main)/home/(user)/_components/home-mobile-navigation";
import { Header } from "./header";
import { PageMobileNavigation } from "@kit/ui/page";

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
    <Header.Root className={className}>
      <Header.Left>
        <PageMobileNavigation className={"flex items-center justify-between"}>
          <HomeMobileNavigation />
        </PageMobileNavigation>
      </Header.Left>
      <Header.Title title={title} />
      {children}

      <Header.Right>{rightContent}</Header.Right>
    </Header.Root>
  );
};

export { PageHeader };
