import { useTranslation } from "react-i18next";

interface ServiceTypeSectionProps {
  service: {
    name: string;
    price: number;
    currency: string;
    recurrence?: string;
    service_image?: string | null;
  };
  isDarkBackground: boolean;
  quantity: number; 
}

export const ServiceTypeSection: React.FC<ServiceTypeSectionProps> = ({
  service,
  isDarkBackground,
  quantity,
}) => {
  const { t } = useTranslation('services');

  const textColor = isDarkBackground ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = isDarkBackground
    ? 'text-gray-300'
    : 'text-gray-500';

  return (
    <div className="flex items-start gap-4 rounded-lg p-1">
      {/* Imagen */}
      {service.service_image ? (
        <img
          src={service.service_image}
          alt={service.name}
          className="h-20 w-40 rounded-md object-cover"
        />
      ) : (
        <div className="h-20 w-40 rounded-md bg-gray-200" />
      )}

      <div className="flex flex-col mt-1 justify-between">
        <span className={`text-base font-medium ${textColor}`}>
          {service.name}
        </span>
        <span className={`text-sm ${secondaryTextColor}`}>
          {t(`${quantity} x`)}
        </span>
        <span className={`text-base font-medium ${textColor}`}>
          ${service.price.toFixed(2)} {service.currency.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
