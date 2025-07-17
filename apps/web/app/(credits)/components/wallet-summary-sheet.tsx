"use client";

import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@kit/ui/sheet";
import { SheetContent } from "@kit/ui/sheet";
import { SheetHeader } from "@kit/ui/sheet";
import { SheetTitle } from "@kit/ui/sheet";
import WalletButton from "./wallet-button";
import { useTranslation } from "react-i18next";
import { Separator } from "@kit/ui/separator";
import { X } from "lucide-react";
import { formatDate } from "date-fns";
import { Button } from "@kit/ui/button";
import { getCredit } from "~/server/actions/credits/credits.action";
import { useQuery } from "@tanstack/react-query";
import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import { Spinner } from "@kit/ui/spinner";
import { Credit } from "~/lib/credit.types";
import { statusConfig } from "../lib/style-configs";
import { isValid, parseISO } from "date-fns";
import { CreditIcon } from "~/components/icons/icons";
import { cn } from "@kit/ui/utils";

interface WalletSummarySheetProps {
  className?: string;
  triggerClassName?: string;
}

const WalletSummarySheet = ({ className, triggerClassName }: WalletSummarySheetProps) => {
  const { t } = useTranslation("credits");

  const { workspace: userWorkspace, organization } = useUserWorkspace();
  const userRole = userWorkspace?.role;

  const isClient = userRole?.includes("client_");
  const creditsEnabled = organization?.settings?.credits?.enable_credits;

  const isEnable = isClient && creditsEnabled;
  const clientOrganizationId = organization?.id ?? "";

  const { data: credit, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getCredit(clientOrganizationId),
    enabled: isEnable,
    retry: false,
  });

  const lastMovementDateRaw = credit?.updated_at ?? credit?.created_at ?? "";
  const lastMovementDate = lastMovementDateRaw ? parseISO(lastMovementDateRaw) : null;
  const isValidDate = lastMovementDate && isValid(lastMovementDate);

  if (!isEnable) return null;
  if (isLoading) return <Spinner className="w-4 h-4" />;

  return (
    <Sheet>
      <SheetTrigger asChild className={triggerClassName}>
        <WalletButton value={credit?.balance ?? 0} />
      </SheetTrigger>

      <SheetContent className={cn("flex flex-col gap-2", className)}>
        <SheetClose asChild className="absolute top-2 right-2">
          <Button variant="outline" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </SheetClose>

        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CreditIcon className="w-6 h-6" />
            {t("wallet.title")}
          </SheetTitle>
        </SheetHeader>

        <SheetDescription className="text-gray-600">
          {t("wallet.description")}
        </SheetDescription>

        <Separator className="my-4" />

        <WalletStatusSection t={t} credit={credit ?? null} />

        <SheetFooter className="mt-auto border-t py-4">
          <span className="text-gray-500 text-sm">
            {t("wallet.lastMovement", {
              date: isValidDate ? formatDate(lastMovementDate, "PP") : "-",
            })}
          </span>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
interface WalletStatusSectionProps {
  t: (str: string) => string;
  credit: Credit.Response | null;
}

const WalletStatusSection = ({ t, credit }: WalletStatusSectionProps) => {
  if (!credit) return null;

  const creditValues = {
    available: credit.balance,
    used: credit.consumed,
    purchased: credit.purchased,
    expired: credit.expired,
    locked: credit.locked,
  };

  return (
    <div className="flex flex-col gap-4 divide-y ">
      {statusConfig.map(({ key, icon, accent }) => (
        <WalletStatusItem
          key={key}
          icon={icon}
          value={creditValues[key] ?? 0}
          label={t(`status.plural.${key}`)}
          description={t(`status.description.${key}`)}
          accent={accent}
        />
      ))}
    </div>
  );
};

const WalletStatusItem = ({
  value,
  label,
  description,
  icon,
  accent,
}: {
  value: number;
  label: string;
  description: string;
  icon?: React.ReactNode;
  accent?: string;
}) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-transparent w-full">
      {icon}
      <div className="flex-1">
        <div className="flex items-center gap-2 justify-between">
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className={`text-lg font-bold ${accent}`}>{value}</span>
        </div>
        <p className="text-xs text-gray-600 mr-3">{description}</p>
      </div>
    </div>
  );
};

export default WalletSummarySheet;
