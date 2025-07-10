import Link from "next/link";
import { useState } from "react";
import { Pen, MoreVertical, Link2, Check } from "lucide-react";
import { Button } from "@kit/ui/button";
// import { Switch } from "@kit/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kit/ui/dropdown-menu";
import { Trans } from "@kit/ui/trans";
import { ServiceCardActionsProps } from "../../types";
// import { useServiceApiActions } from "../../hooks/use-service-api-actions";
import { canUserEditService, ANIMATION_CLASSES } from "../../lib/utils";

export function ServiceCardActions({
  service,
  userRole,
}: ServiceCardActionsProps) {
  // const { updateService } = useServiceApiActions();
  const canEdit = canUserEditService(userRole);
  // const isVisible = service.visibility === "public";
  const [copied, setCopied] = useState(false);

  // const handleVisibilityToggle = () => {
  //   if (!canEdit) return;

  //   const newVisibility = isVisible ? "private" : "public";
  //   updateService.mutate({
  //     id: service.id,
  //     data: { visibility: newVisibility },
  //   });
  // };

  const handleCopyCheckoutUrl = () => {
    if (!service.checkout_url) return;

    void navigator.clipboard.writeText(service.checkout_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Edit Actions Dropdown - Only for valid roles */}
      {canEdit && (
        <div
          className={`absolute top-3 right-3 ${ANIMATION_CLASSES.OVERLAY_FADE} z-10`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-white/70 text-gray-700 hover:bg-white h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="flex flex-col gap-1 p-2"
            >
              <DropdownMenuItem
                asChild
                className="text-gray-600 cursor-pointer"
              >
                <Link href={`/services/update?id=${service.id}`}>
                  <Pen className="mr-2 h-4 w-4" />
                  <Trans i18nKey="services:catalog.card.edit" defaults="Edit" />
                </Link>
              </DropdownMenuItem>

              {service.checkout_url && (
                <DropdownMenuItem
                  onClick={handleCopyCheckoutUrl}
                  className="text-gray-600 cursor-pointer"
                >
                  {copied ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Link2 className="mr-2 h-4 w-4" />
                  )}
                  <Trans
                    i18nKey="services:catalog.card.checkout"
                    defaults="Copy"
                  />
                </DropdownMenuItem>
              )}

              {/* <DropdownMenuItem
                className="text-gray-600 cursor-pointer flex items-center"
                onSelect={(e) => e.preventDefault()}
              >
                <Switch
                  checked={isVisible}
                  onCheckedChange={handleVisibilityToggle}
                  disabled={isLoading}
                  className="mr-2"
                />
                <span>
                  <Trans
                    i18nKey="services:catalog.card.visibility"
                    defaults="Show in catalog"
                  />
                </span>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}
