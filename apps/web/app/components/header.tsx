import { Trans } from "@kit/ui/trans";
import { cn } from "@kit/ui/utils";
import { TimerContainer } from "./timer-container";
import WalletSummarySheet from "~/(credits)/components/wallet-summary-sheet";

interface HeaderRootProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Page Header component
 * @param title - The title of the page
 * @param className - The className of the page header
 * @param children - The children of the page header
 */
export const HeaderRoot = ({ title, className, children }: HeaderRootProps) => {
  return (
    <header className={cn("flex h-9 items-center justify-between", className)}>
      <h2 className="font-inter text-xl font-medium leading-4">
        <Trans i18nKey={title} />
      </h2>
      {children}
    </header>
  );
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
    <div className="flex items-center gap-2 ml-2">
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

const Header = {
  Root: HeaderRoot,
  Right: HeaderRight,
};

export { Header };
