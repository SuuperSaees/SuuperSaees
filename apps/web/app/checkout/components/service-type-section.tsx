import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { useTranslation } from 'react-i18next';

import { ServiceType } from '../types/billing-form-types';

interface ServiceTypeSectionProps {
  service: ServiceType;
}

export const ServiceTypeSection: React.FC<ServiceTypeSectionProps> = ({
  service,
}) => {
  const { t } = useTranslation('services');
  const { theme_color } = useOrganizationSettings();

  return (
    <div className="mb-4 mt-7 flex flex-col gap-y-1">
      <div className="font-inter text-base font-semibold leading-[2.375] text-gray-900">
        {t('checkout.typeOfService')}
      </div>
      <div
        className="flex w-full items-start gap-2 rounded-xl border-2 bg-white p-4 md:w-60"
        style={{ borderColor: theme_color ?? '#000000' }}
      >
        <div
          className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border"
          style={{
            borderColor: theme_color ?? '#000000',
            backgroundColor: theme_color ?? '#000000',
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-[1.42857] text-gray-700 md:text-base">
            {service.recurrence
              ? t(`checkout.${service.recurrence}`)
              : t('checkout.oneTime')}
          </span>
          <span className="text-sm font-normal leading-[1.42857] text-gray-600 md:text-base">
            ${service.price} {service.currency.toUpperCase()}
          </span>
          {service.recurrence && (
            <span className="text-sm font-normal leading-[1.42857] text-gray-600 md:text-base">
              {t('checkout.preposition')} {service.recurrence}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
