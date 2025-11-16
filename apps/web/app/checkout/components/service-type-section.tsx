import { useTranslation } from "react-i18next";
import { Invoice } from '~/lib/invoice.types';
import { InvoiceTypeSection } from './invoice-type-section';

interface ServiceTypeSectionProps {
  service?: {
    name?: string | null;
    price?: number | null;
    currency?: string | null;
    recurrence?: string | null;
    service_image?: string | null;
    test_period?: boolean | null;
    test_period_price?: number | null;
    test_period_duration?: number | null;
    test_period_duration_unit_of_measurement?: string | null;
    recurring_subscription?: boolean | null;
  };
  invoice?: Invoice.Response;
  isDarkBackground: boolean;
  quantity?: number; 
}

export const ServiceTypeSection: React.FC<ServiceTypeSectionProps> = ({
  service,
  invoice,
  isDarkBackground,
}) => {
  const { t } = useTranslation('services');

  const textColor = isDarkBackground ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = isDarkBackground
    ? 'text-gray-300'
    : 'text-gray-500';

  const getUnit = (unit: string, duration: number) => {
    const isPlural = duration > 1;
    if (unit.includes('day')) {
      return isPlural ? t('checkout.trial.days') : t('checkout.trial.day');
    }
    if (unit.includes('week')) {
      return isPlural ? t('checkout.trial.weeks') : t('checkout.trial.week');
    }
    if (unit.includes('month')) {
      return isPlural ? t('checkout.trial.months') : t('checkout.trial.month');
    }
    if (unit.includes('year')) {
      return isPlural ? t('checkout.trial.years') : t('checkout.trial.year');
    }
  };

  const getTestPeriodPrice = () => {
    return `${t('for')} $${service?.test_period_price?.toFixed(2)} ${t('then')}`;
  };

  const getPerRecurrence = (recurrence: string) => {
    if(recurrence.includes('month')) {
      return `${t(`checkout.trial.per${'Month'}`)}`;
    }
    if(recurrence.includes('year')) {
      return `${t(`checkout.trial.per${'Year'}`)}`;
    }
    if(recurrence.includes('week')) {
      return `${t(`checkout.trial.per${'Week'}`)}`;
    }
    if(recurrence.includes('day')) {
      return `${t(`checkout.trial.per${'Day'}`)}`;
    }
    return '';
  };

  // Si es una factura, usar el componente específico para invoices
  if (invoice) {
    return <InvoiceTypeSection invoice={invoice} isDarkBackground={isDarkBackground} />;
  }

  return (
    <div className="flex items-start gap-4 rounded-lg p-1">
      {/* Imagen - solo para servicios */}
      {service?.service_image ? (
        <img
          src={service?.service_image}
          alt={service?.name ?? ''}
          className="h-20 w-40 rounded-md object-cover"
        />
      ) : (
        <div className="h-20 w-40 rounded-md bg-gray-200" />
      )}

      <div className="flex flex-col mt-1 justify-between">
        {/* Nombre del servicio */}
        <span className={`text-base font-medium ${textColor}`}>
          {service?.name}
        </span>

        {/* Detalles del período de prueba - solo para servicios */}
        {service?.test_period && (
          <span className={`text-sm ${secondaryTextColor}`}>
            {service?.test_period_duration} {getUnit(service?.test_period_duration_unit_of_measurement ?? '', service?.test_period_duration ?? 0)} {getTestPeriodPrice()}
          </span>
        )}

        {/* Precio */}
        <span className={`text-base font-medium ${textColor}`}>
          ${(service?.price ?? 0)?.toFixed(2)} {service?.currency?.toUpperCase() ?? 'USD'} {service?.recurring_subscription ? getPerRecurrence(service?.recurrence ?? '') : ''}
        </span>
      </div>
    </div>
  );
};
