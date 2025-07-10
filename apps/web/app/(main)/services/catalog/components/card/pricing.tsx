import { Trans } from "@kit/ui/trans";
import { formatCurrency } from "@kit/shared/utils";
import { ServicePricingProps } from "../../types";
import { hasFreeTrial } from "../../lib/utils";

export function ServicePricing({
  service,
  recurrenceText,
}: ServicePricingProps) {
  const isFreeTrial = hasFreeTrial(service);

  return (
    <div className="flex flex-col gap-2">
      {isFreeTrial && (
        <span className="text-gray-600 text-sm">
          <Trans
            i18nKey={
              service.number_of_clients === 1
                ? service.test_period_duration_unit_of_measurement === "day"
                  ? "services:catalog.card.pricing.free.singular.day"
                  : service.test_period_duration_unit_of_measurement === "week"
                    ? "services:catalog.card.pricing.free.singular.week"
                    : service.test_period_duration_unit_of_measurement === "month"
                      ? "services:catalog.card.pricing.free.singular.month"
                      : "services:catalog.card.pricing.free.singular.year"
                : service.test_period_duration_unit_of_measurement === "day"
                  ? "services:catalog.card.pricing.free.plural.day"
                  : service.test_period_duration_unit_of_measurement === "week"
                    ? "services:catalog.card.pricing.free.plural.week"
                    : service.test_period_duration_unit_of_measurement === "month"
                      ? "services:catalog.card.pricing.free.plural.month"
                      : "services:catalog.card.pricing.free.plural.year"
            }
            values={{
              times: service.test_period_duration,
              currency: formatCurrency(
                service?.currency?.toUpperCase() ?? "USD",
                0
              )
            }}
          />
        </span>
      )}

      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-gray-900">
          {formatCurrency(
            service?.currency?.toUpperCase() ?? "USD",
            service?.price ?? 0,
          )}
        </span>
        
        <p className="text-gray-600 font-medium">
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
      </div>

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
