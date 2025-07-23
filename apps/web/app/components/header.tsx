import { cn } from "@kit/ui/utils";
import { TimerContainer } from "./timer-container";
import WalletSummarySheet from "~/(credits)/components/wallet-summary-sheet";
import { Trans } from "@kit/ui/trans";

interface HeaderRootProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Page Header component
 * @param title - The title of the page
 * @param className - The className of the page header
 * @param children - The children of the page header
 */
export const HeaderRoot = ({ className, children }: HeaderRootProps) => {
  return (
    <header className={cn("flex h-9 items-center gap-2", className)}>
      {/* <h2 className="font-inter text-xl font-medium leading-4">
        <Trans i18nKey={title} />
      </h2> */}
      {children}
    </header>
  );
};

export const HeaderLeft = ({ children }: { children?: React.ReactNode }) => {
  return <div className="flex items-center gap-2">{children}</div>;
};
/**
 * Return and wrap the shared business features across the app
 * Example: Timer and Wallet Summary
 */
export const HeaderRight = ({
  children,
  enableDefaults = true,
}: {
  children?: React.ReactNode;
  enableDefaults?: boolean;
}) => {
  return (
    <div className="flex items-center gap-2 ml-auto">
      {enableDefaults && (
        <>
          <TimerContainer />
          <WalletSummarySheet />
        </>
      )}
      {children}
    </div>
  );
};

export const HeaderTitle = ({ title }: { title: string }) => {
  return (
    <h2 className="font-inter text-xl font-medium leading-4">
      <Trans i18nKey={title} />
    </h2>
  );
};

const Header = {
  Root: HeaderRoot,
  Left: HeaderLeft,
  Right: HeaderRight,
  Title: HeaderTitle,
};

export { Header };
