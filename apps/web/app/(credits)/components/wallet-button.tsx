import { forwardRef } from "react";
import { Button, ButtonProps } from "@kit/ui/button";
import { cn } from "@kit/ui/utils";
import { Trans } from "@kit/ui/trans";
import { CreditIcon } from "~/components/icons/icons";

const WalletButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        aria-label="Wallet"
        className={cn(
          "flex items-center gap-2 text-gray-600 font-medium",
          className,
        )}
        {...props}
      >
        <CreditIcon className="w-4 h-4" />
        <span className="inline-flex gap-1 items-center">
          <span>{value}</span>
          <span className="hidden md:inline">
            <Trans
              i18nKey={
                value === 1
                  ? "credits:wallet.value.singular"
                  : "credits:wallet.value.plural"
              }
            />
          </span>
        </span>
      </Button>
    );
  },
);

WalletButton.displayName = "WalletButton";

export default WalletButton;
