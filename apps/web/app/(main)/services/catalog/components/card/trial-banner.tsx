import { Trans } from "@kit/ui/trans";
import { ServiceTrialBannerProps } from "../../types/service-card";
import { hasFreeTrial } from "../../lib/service-card";

export function ServiceTrialBanner({ service }: ServiceTrialBannerProps) {
  if (!hasFreeTrial(service)) return null;

  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg">
        <Trans
          i18nKey="services:catalog.card.features.freeTrial"
          defaults={`FREE ${service.test_period_duration} ${service.test_period_duration_unit_of_measurement?.toUpperCase()}`}
        />
      </div>
    </div>
  );
} 