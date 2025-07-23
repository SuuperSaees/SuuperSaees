"use client";

import { PlusIcon } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import PrefetcherLink from "../../../components/shared/prefetcher-link";
import { cn } from "@kit/ui/utils";
import { useTranslation } from "react-i18next";

const CreateOrderButton = ({ className }: { className?: string }) => {

  const { t } = useTranslation();
  return (
    <PrefetcherLink href="/orders/create" className={cn(className)}>
      <ThemedButton className="h-fit" aria-label={t("orders:create")}>
        <PlusIcon className="h-4 w-4" />
        <span>{t("orders:create")}</span>
      </ThemedButton>
    </PrefetcherLink>
  );
};

export default CreateOrderButton;
