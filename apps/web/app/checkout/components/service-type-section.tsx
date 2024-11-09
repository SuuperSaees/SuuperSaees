import { useTranslation } from 'react-i18next';

import { ServiceType } from '../types/billing-form-types';

interface ServiceTypeSectionProps {
  service: ServiceType;
}

export const ServiceTypeSection: React.FC<ServiceTypeSectionProps> = ({
  service,
}) => {
  const { t } = useTranslation('services');

  return (
    <div className="mb-4 mt-7 flex flex-col gap-y-1">
      <div className="text-gray-900 font-inter text-base font-semibold leading-[2.375]">
        {t('checkout.typeOfService')}
      </div>
      <div className="flex w-full items-start gap-2 rounded-xl border-2 border-brand bg-white p-4 md:w-60">
        <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-brand bg-brand">
          <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-[1.42857] text-gray-700 md:text-base">
            {
              service.recurrence ? t(`checkout.${service.recurrence}`) : t('checkout.oneTime')
            }
          </span>
          <span className="text-sm font-normal leading-[1.42857] text-gray-600 md:text-base">
            ${service.price} USD
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
