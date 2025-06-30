import { useTranslation } from "react-i18next";
import { Invoice } from '~/lib/invoice.types';

interface InvoiceTypeSectionProps {
  invoice: Invoice.Response;
  isDarkBackground: boolean;
}

export const InvoiceTypeSection: React.FC<InvoiceTypeSectionProps> = ({
  invoice,
  isDarkBackground,
}) => {
  const { t } = useTranslation('services');

  const textColor = isDarkBackground ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = isDarkBackground
    ? 'text-gray-300'
    : 'text-gray-500';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t('language') === 'es' ? 'es-ES' : 'en-US');
  };

  return (
    <div className="flex items-start gap-4 rounded-lg p-1">
      {/* Icono de factura en lugar de imagen */}
      <div className="h-20 w-40 rounded-md bg-blue-100 flex items-center justify-center">
        <svg 
          className="h-12 w-12 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      </div>

      <div className="flex flex-col mt-1 justify-between">
        {/* Número de factura */}
        <span className={`text-base font-medium ${textColor}`}>
          Invoice #{invoice.number}
        </span>

        {/* Información adicional de la factura */}
        <div className="flex flex-col gap-1">
          {invoice.due_date && (
            <span className={`text-sm ${secondaryTextColor}`}>
              {t('checkout.invoice.dueDate')}: {formatDate(invoice.due_date)}
            </span>
          )}
          
          {invoice.client?.name && (
            <span className={`text-sm ${secondaryTextColor}`}>
              {t('checkout.invoice.client')}: {invoice.client.name}
            </span>
          )}
        </div>

        {/* Precio total */}
        <span className={`text-base font-medium ${textColor}`}>
          ${invoice.total_amount?.toFixed(2)} {invoice.currency?.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
