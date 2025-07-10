import { Trans } from "@kit/ui/trans";
import { ServiceCardImageProps } from "../../types";
import { ServiceCardActions } from "./actions";
import { 
  getServiceImageUrl, 
  shouldShowServiceTypeBadge,
  CARD_DIMENSIONS,
  ANIMATION_CLASSES
} from "../../lib/utils";

export function ServiceCardImage({ service, serviceTags, userRole }: ServiceCardImageProps) {
  const imageUrl = getServiceImageUrl(service);
  const showTypeBadge = shouldShowServiceTypeBadge(serviceTags);

  return (
    <div className={`relative ${CARD_DIMENSIONS.IMAGE_HEIGHT} w-full overflow-hidden rounded-t-xl`}>
      {/* Status Badge */}
      {service.status === "active" && (
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-800 shadow-sm">
          <Trans
            i18nKey="services:catalog.card.status.active"
            defaults="Active"
          />
        </div>
      )}

      {/* Service Type Badge - Only show if not redundant with tags */}
      {showTypeBadge && (
        <div className="absolute right-3 top-3 z-10 rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 shadow-sm">
          {service.single_sale === true ? (
            <Trans
              i18nKey="services:catalog.card.type.oneTime"
              defaults="One-time"
            />
          ) : service.recurring_subscription === true ? (
            <Trans
              i18nKey="services:catalog.card.type.subscription"
              defaults="Subscription"
            />
          ) : (
            <Trans
              i18nKey="services:catalog.card.type.service"
              defaults="Service"
            />
          )}
        </div>
      )}

      {/* Service Image */}
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={service.name ?? "service"}
        className={`h-full w-full object-cover ${ANIMATION_CLASSES.IMAGE_HOVER}`}
      />

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent ${ANIMATION_CLASSES.OVERLAY_FADE}`} />

      {/* Action Buttons */}
      <ServiceCardActions service={service} userRole={userRole} />
    </div>
  );
} 