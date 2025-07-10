import { Trans } from "@kit/ui/trans";
import { formatCurrency } from "@kit/shared/utils";
import { ServicePricingProps } from "../../types";
// import { hasFreeTrial } from "../../lib/utils";

export function ServicePricing({ service, recurrenceText }: ServicePricingProps) {
  // const isFreeTrial = hasFreeTrial(service);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        {/* {isFreeTrial ? (
          <>
            <span className="text-3xl font-bold text-green-600">
              <Trans
                i18nKey="services:catalog.card.pricing.free"
                defaults="FREE"
              />
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatCurrency(
                service?.currency?.toUpperCase() ?? "USD",
                service?.price ?? 0,
              )}
            </span>
          </>
        ) : ( */}
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(
              service?.currency?.toUpperCase() ?? "USD",
              service?.price ?? 0,
            )}
          </span>
        {/* )} */}
      </div>
      
      <p className="text-sm font-medium text-gray-600">
        {service.single_sale === true ? (
          <Trans
            i18nKey="services:catalog.card.pricing.oneTime"
            defaults="One-time payment"
          />
        ) : recurrenceText ? (
          <Trans
            i18nKey={recurrenceText.key}
            defaults={recurrenceText.defaults}
          />
        ) : (
          <Trans
            i18nKey="services:catalog.card.pricing.contact"
            defaults="Contact for pricing"
          />
        )}
      </p>
      
      {/* {isFreeTrial && (
        <p className="text-xs text-emerald-600 font-bold mt-1">
          <Trans
            i18nKey="services:catalog.card.pricing.thenRegularPrice"
            defaults={`Then ${formatCurrency(
              service?.currency?.toUpperCase() ?? "USD",
              service?.price ?? 0,
            )} ${recurrenceText?.defaults.toLowerCase() ?? "per billing cycle"}`}
          />
        </p>
      )} */}
    </div>
  );
} 