import Link from "next/link";
import { Eye, EyeOff, SquarePen, ShoppingCart } from "lucide-react";
import { Button } from "@kit/ui/button";
import { Trans } from "@kit/ui/trans";
import Tooltip from "~/components/ui/tooltip";
import { ServiceCardActionsProps } from "../../types";
import { useServiceApiActions } from "../../hooks/use-service-api-actions";
import { canUserEditService, ANIMATION_CLASSES } from "../../lib/utils";

export function ServiceCardActions({ service, userRole }: ServiceCardActionsProps) {
  const { updateService, isLoading } = useServiceApiActions();
  const canEdit = canUserEditService(userRole);
  const isVisible = service.visibility === "public";

  const handleVisibilityToggle = () => {
    if (!canEdit) return;

    const newVisibility = isVisible ? "private" : "public";
    updateService.mutate({
      id: service.id,
      data: { visibility: newVisibility },
    });
  };

  return (
    <>
      {/* Edit Actions - Only for valid roles */}
      {canEdit && (
        <div className={`absolute bottom-3 left-3 ${ANIMATION_CLASSES.OVERLAY_FADE} flex items-center justify-center gap-2`}>
          <Tooltip
            content={
              <Trans
                i18nKey={`services:catalog.card.${isVisible ? "hide" : "show"}`}
                defaults={`${isVisible ? "Hide from catalog" : "Show in catalog"}`}
              />
            }
          >
            <Button
              size="sm"
              onClick={handleVisibilityToggle}
              disabled={isLoading}
              className={`rounded-lg bg-white/95 text-gray-700 shadow-md hover:bg-white hover:shadow-lg border border-gray-200 hover:bg-gray-100 ${ANIMATION_CLASSES.BUTTON_HOVER}`}
            >
              {isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
          
          <Tooltip
            content={
              <Trans i18nKey="services:catalog.card.edit" defaults="Edit" />
            }
          >
            <Link
              href={`/services/update?id=${service.id}`}
              className={`rounded-lg bg-white/95 text-gray-700 shadow-md hover:shadow-lg border border-gray-200 h-8 px-3 flex items-center justify-center hover:bg-gray-100 ${ANIMATION_CLASSES.BUTTON_HOVER}`}
            >
              <SquarePen className="h-4 w-4" />
            </Link>
          </Tooltip>
        </div>
      )}

      {/* Quick Purchase Action */}
      {service.checkout_url && (
        <div className={`absolute bottom-3 right-3 ${ANIMATION_CLASSES.OVERLAY_FADE}`}>
          <Tooltip
            content={
              <Trans
                i18nKey="services:catalog.card.purchase"
                defaults="Get Started"
              />
            }
          >
            <Link href={service.checkout_url}>
              <Button
                size="sm"
                className={`rounded-lg bg-white/95 text-gray-700 shadow-md hover:bg-white hover:shadow-lg border border-gray-200 hover:bg-gray-100 ${ANIMATION_CLASSES.BUTTON_HOVER}`}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>
          </Tooltip>
        </div>
      )}
    </>
  );
} 