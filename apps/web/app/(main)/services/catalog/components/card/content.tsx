import Link from "next/link";
import { Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@kit/ui/button";
import { Trans } from "@kit/ui/trans";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { ServiceCardContentProps } from "../../types";
import { ServiceTags } from "./tags";
import { ServicePricing } from "./pricing";
import { 
  getServiceDescription, 
  hasFreeTrial, 
  isServiceAvailable,
  ANIMATION_CLASSES
} from "../../lib/utils";

export function ServiceCardContent({
  service,
  serviceTags,
  recurrenceText,
  logoUrl,
  themeColor,
}: ServiceCardContentProps) {
  const description = getServiceDescription(service);
  const isFreeTrial = hasFreeTrial(service);
  const isAvailable = isServiceAvailable(service);

  return (
    <div className="flex flex-col p-6">
      {/* Service Name */}
      <h3
        className="mb-2 text-xl font-bold leading-tight text-gray-900 line-clamp-1"
        title={service.name}
      >
        {service.name}
      </h3>

      {/* Description */}
      <p
        className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2"
        title={description}
      >
        {description}
      </p>

      {/* Client Info & Availability */}
      <div className="mb-4 flex items-center gap-4 text-xs text-gray-600">
        {service.number_of_clients && service.number_of_clients > 0 ? (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {service.number_of_clients}{" "}
              <Trans
                i18nKey={
                  service.number_of_clients === 1
                    ? "services:catalog.card.clients.singular"
                    : "services:catalog.card.clients.plural"
                }
                defaults={
                  service.number_of_clients === 1 ? "client" : "clients"
                }
              />
            </span>
          </div>
        ) : null}

        {isAvailable && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-green-500" />
            <span className="font-medium text-green-600">
              <Trans
                i18nKey="services:catalog.card.available"
                defaults="Available now"
              />
            </span>
          </div>
        )}
      </div>

      {/* Service Tags */}
      <ServiceTags tags={serviceTags} />

      {/* Pricing */}
      <ServicePricing service={service} recurrenceText={recurrenceText} />

      {/* CTA Button */}
      {service.checkout_url ? (
        <Link href={service.checkout_url} className="w-full">
          <ThemedButton
            className={`w-full font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg ${ANIMATION_CLASSES.BUTTON_HOVER} group/btn`}
            size="lg"
            themeColor={themeColor}
          >
            <span className="flex items-center justify-center gap-2">
              {isFreeTrial ? (
                <Trans
                  i18nKey="services:purchase.startTrial"
                  defaults="Start Free Trial"
                />
              ) : (
                <Trans
                  i18nKey="services:catalog.card.purchase"
                  defaults="Get Started"
                />
              )}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </span>
          </ThemedButton>
        </Link>
      ) : (
        <Button
          className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
          size="lg"
          disabled
        >
          <Trans
            i18nKey="services:catalog.card.unavailable"
            defaults="Unavailable"
          />
        </Button>
      )}

      {/* Service Attributes */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-green-600">✓</span>
            <Trans
              i18nKey="services:catalog.card.features.professional"
              defaults="Professional service"
            />
          </span>
        </div>

        {/* Company Logo */}
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Company Logo"
            className="h-6 w-6 rounded object-contain opacity-60"
          />
        )}
      </div>
    </div>
  );
} 