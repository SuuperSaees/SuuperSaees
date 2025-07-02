'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Download } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { Invoice } from '~/lib/invoice.types';
import { useInvoicePDF } from '../../hooks/use-invoice-pdf';
import Image from 'next/image';

interface PaidInvoiceViewProps {
  invoice: Invoice.Response;
  logoUrl: string;
}

export const PaidInvoiceView: React.FC<PaidInvoiceViewProps> = ({
  invoice,
  logoUrl,
}) => {
  const { t } = useTranslation(['services', 'invoices']);
  const { downloadInvoicePDF } = useInvoicePDF();
  const [isDownloading, setIsDownloading] = useState(false);

  // Local format currency function
  const formatCurrency = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t('language') === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(invoice);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Find the latest payment
  const latestPayment = invoice.invoice_payments?.[0];
  const paymentDate = latestPayment?.processed_at ?? invoice.updated_at;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with logo */}
        <div className="text-center p-6 border-b border-gray-100">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="Agency logo"
              width={200}
              height={48}
              className="h-12 w-auto mx-auto mb-4"
            />
          )}
          <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
            {invoice.agency?.name ?? t('invoices:agency')}
          </div>
        </div>

        {/* Success icon and status */}
        <div className="text-center p-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t('services:checkout.invoice.paidTitle', 'Invoice Paid')}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {t('services:checkout.invoice.paidDescription', 'Your invoice has been successfully paid.')}
          </p>

          {/* Invoice amount */}
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(invoice.total_amount ?? 0, invoice.currency ?? 'USD')}
          </div>
        </div>

        {/* Invoice details */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {t('services:checkout.invoice.invoiceNumber', 'Invoice Number')}
              </span>
              <span className="font-medium text-gray-900">
                {invoice.number}
              </span>
            </div>
            
            {paymentDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t('services:checkout.invoice.paymentDate', 'Payment Date')}
                </span>
                <span className="font-medium text-gray-900">
                  {formatDate(paymentDate)}
                </span>
              </div>
            )}

            {latestPayment?.payment_method && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t('services:checkout.invoice.paymentMethod', 'Payment Method')}
                </span>
                <span className="font-medium text-gray-900 capitalize">
                  {latestPayment.payment_method === 'stripe' ? 'Card' : latestPayment.payment_method}
                  {latestPayment.payment_method === 'stripe' && latestPayment.reference_number && (
                    <span className="text-xs text-gray-500 block">
                      •••• {latestPayment.reference_number.slice(-4)}
                    </span>
                  )}
                </span>
              </div>
            )}

            {invoice.client?.name && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t('services:checkout.invoice.client', 'Client')}
                </span>
                <span className="font-medium text-gray-900">
                  {invoice.client.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 space-y-3">
          <ThemedButton
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2"
            variant="default"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('services:checkout.invoice.downloading', 'Downloading...')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {t('services:checkout.invoice.downloadInvoice', 'Download Invoice')}
              </>
            )}
          </ThemedButton>
        </div>

      </div>
    </div>
  );
};
