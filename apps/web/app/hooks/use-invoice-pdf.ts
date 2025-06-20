"use client";

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePDFManager } from './use-pdf-manager';
import { Invoice, InvoiceItem } from '~/lib/invoice.types';

interface InvoiceTemplate {
  invoice: Invoice.Response;
  companyLogo?: string;
  companyDetails?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export const useInvoicePDF = () => {
  const { t } = useTranslation(['invoices']);
  const { downloadPDF } = usePDFManager();

  const formatCurrency = useCallback((amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const _generateInvoiceHTML = useCallback((template: InvoiceTemplate): string => {
    const { invoice, companyLogo, companyDetails } = template;
    
    const itemsHTML = invoice.invoice_items?.map((item: InvoiceItem.Response) => `
      <tr class="invoice-item">
        <td class="item-description">${item.description}</td>
        <td class="item-quantity">${item.quantity}</td>
        <td class="item-price">${formatCurrency(item.unit_price, invoice.currency)}</td>
        <td class="item-total">${formatCurrency(item.total_price || 0, invoice.currency)}</td>
      </tr>
    `).join('') ?? '';

    const subtotal = invoice.subtotal_amount ?? 0;
    const taxAmount = invoice.tax_amount ?? 0;
    const total = invoice.total_amount || 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
          }
          
          .company-info {
            flex: 1;
          }
          
          .company-logo {
            max-width: 150px;
            max-height: 80px;
            margin-bottom: 15px;
          }
          
          .company-details {
            font-size: 14px;
            line-height: 1.5;
            color: #666;
          }
          
          .company-details .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          
          .invoice-title {
            text-align: right;
            flex: 1;
          }
          
          .invoice-number {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          
          .invoice-dates {
            font-size: 14px;
            color: #666;
          }
          
          .invoice-dates div {
            margin-bottom: 5px;
          }
          
          .billing-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          
          .billing-section {
            flex: 1;
            margin-right: 40px;
          }
          
          .billing-section:last-child {
            margin-right: 0;
          }
          
          .billing-section h3 {
            font-size: 16px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .billing-details {
            font-size: 14px;
            line-height: 1.6;
            color: #666;
          }
          
          .billing-details .client-name {
            font-weight: bold;
            color: #333;
            font-size: 16px;
            margin-bottom: 5px;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .invoice-table th {
            background: #3b82f6;
            color: white;
            padding: 15px 10px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .invoice-table th:last-child {
            text-align: right;
          }
          
          .invoice-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          
          .invoice-table td:last-child {
            text-align: right;
            font-weight: bold;
          }
          
          .invoice-item:nth-child(even) {
            background: #f9fafb;
          }
          
          .item-description {
            font-weight: 500;
            color: #333;
          }
          
          .item-quantity, .item-price {
            text-align: center;
            color: #666;
          }
          
          .totals-section {
            float: right;
            width: 300px;
            margin-top: 20px;
          }
          
          .totals-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .totals-table td {
            padding: 8px 15px;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .totals-table .label {
            text-align: left;
            color: #666;
            font-weight: 500;
          }
          
          .totals-table .amount {
            text-align: right;
            font-weight: bold;
            color: #333;
          }
          
          .totals-table .total-row {
            background: #3b82f6;
            color: white;
            font-size: 16px;
            font-weight: bold;
          }
          
          .totals-table .total-row td {
            border-bottom: none;
            padding: 12px 15px;
          }
          
          .invoice-notes {
            clear: both;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          
          .invoice-notes h4 {
            font-size: 16px;
            color: #3b82f6;
            margin-bottom: 10px;
            font-weight: bold;
          }
          
          .notes-content {
            font-size: 14px;
            line-height: 1.6;
            color: #666;
            background: #f9fafb;
            padding: 15px;
            border-radius: 5px;
          }
          
          .invoice-footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #999;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-paid {
            background: #dcfce7;
            color: #166534;
          }
          
          .status-issued {
            background: #dbeafe;
            color: #1d4ed8;
          }
          
          .status-draft {
            background: #f3f4f6;
            color: #374151;
          }
          
          .status-overdue {
            background: #fee2e2;
            color: #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-info">
              ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" class="company-logo">` : ''}
              <div class="company-details">
                ${companyDetails ? `
                  <div class="company-name">${companyDetails.name}</div>
                  <div>${companyDetails.address}</div>
                  ${companyDetails.phone ? `<div>Phone: ${companyDetails.phone}</div>` : ''}
                  ${companyDetails.email ? `<div>Email: ${companyDetails.email}</div>` : ''}
                  ${companyDetails.website ? `<div>Website: ${companyDetails.website}</div>` : ''}
                ` : `
                  <div class="company-name">${invoice.agency?.name ?? 'Your Company'}</div>
                `}
              </div>
            </div>
            <div class="invoice-title">
              <div class="invoice-number">INVOICE</div>
              <div class="invoice-number" style="font-size: 24px; margin-bottom: 15px;">#${invoice.number}</div>
              <div class="invoice-dates">
                <div><strong>Issue Date:</strong> ${formatDate(invoice.issue_date)}</div>
                <div><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</div>
                <div class="status-badge status-${invoice.status}">${invoice.status.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
          
          <div class="billing-info">
            <div class="billing-section">
              <h3>Bill From</h3>
              <div class="billing-details">
                <div class="client-name">${invoice.agency?.name ?? 'Your Company'}</div>
              </div>
            </div>
            <div class="billing-section">
              <h3>Bill To</h3>
              <div class="billing-details">
                <div class="client-name">${invoice.client?.name ?? 'Client Name'}</div>
              </div>
            </div>
          </div>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: center;">Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="amount">${formatCurrency(subtotal, invoice.currency)}</td>
              </tr>
              ${taxAmount > 0 ? `
                <tr>
                  <td class="label">Tax:</td>
                  <td class="amount">${formatCurrency(taxAmount, invoice.currency)}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td class="label">Total:</td>
                <td class="amount">${formatCurrency(total, invoice.currency)}</td>
              </tr>
            </table>
          </div>
          
          ${invoice.notes ? `
            <div class="invoice-notes">
              <h4>Notes</h4>
              <div class="notes-content">${invoice.notes}</div>
            </div>
          ` : ''}
          
          <div class="invoice-footer">
            <p>Thank you for your business!</p>
            <p>This invoice was generated on ${formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }, [formatCurrency, formatDate]);

  const generateInvoicePDF = useCallback(async (
    invoice: Invoice.Response,
    _options?: {
      companyLogo?: string;
      companyDetails?: InvoiceTemplate['companyDetails'];
      filename?: string;
    }
  ): Promise<Blob> => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Page setup
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Colors (inspired by the Dribbble design)
      const darkGray: [number, number, number] = [17, 24, 39]; // #111827
      const mediumGray: [number, number, number] = [107, 114, 128]; // #6B7280
      const lightGray: [number, number, number] = [156, 163, 175]; // #9CA3AF
      const green: [number, number, number] = [16, 185, 129]; // #10B981 for design work
      const yellow: [number, number, number] = [245, 158, 11]; // #F59E0B for development work

      // Header Section - Horizontal Layout like Dribbble design
      // Left side - Company logo and name
      pdf.setFillColor(...darkGray);
      pdf.roundedRect(margin, yPosition, 10, 10, 2, 2, 'F');
      
      // Company logo initials
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      const companyName = invoice.agency?.name ?? 'Ace Studio';
      const companyInitials = companyName.substring(0, 2).toUpperCase();
      pdf.text(companyInitials, margin + 5, yPosition + 7, { align: 'center' });
      
      // Company name next to logo
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkGray);
      pdf.text(companyName, margin + 15, yPosition + 7);

      // Right side - Invoice meta info in horizontal layout
      const rightSideX = pageWidth - margin - 120;
      
      // Invoice Number
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      pdf.text('Invoice Number', rightSideX, yPosition + 2);
      pdf.setTextColor(...darkGray);
      pdf.setFont('helvetica', 'bold');
      pdf.text(invoice.number, rightSideX, yPosition + 8);
      
      // Issued Date
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      pdf.text('Issued', rightSideX + 40, yPosition + 2);
      pdf.setTextColor(...darkGray);
      pdf.setFont('helvetica', 'bold');
      const issuedDate = invoice.created_at ? formatDate(invoice.created_at) : formatDate(new Date().toISOString());
      pdf.text(issuedDate, rightSideX + 40, yPosition + 8);
      
      // Due Date (only if available)
      if (invoice.due_date) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...mediumGray);
        pdf.text('Due Date', rightSideX + 80, yPosition + 2);
        pdf.setTextColor(...darkGray);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatDate(invoice.due_date), rightSideX + 80, yPosition + 8);
      }

      yPosition += 25;

      // From/To Section with direction indicators
      const sectionWidth = (pageWidth - 2 * margin - 20) / 2;
      
      // FROM section
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...mediumGray);
      pdf.text('↗ FROM', margin, yPosition);
      
      yPosition += 8;
      
      // Company avatar (dark circle)
      pdf.setFillColor(...darkGray);
      pdf.circle(margin + 8, yPosition + 8, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(companyInitials, margin + 8, yPosition + 10, { align: 'center' });
      
      // Company details
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(companyName, margin + 20, yPosition + 6);
      
      // Additional agency info (placeholder for future fields)
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      pdf.text('Pay@Acestudio.pro', margin + 20, yPosition + 12);
      
      // Contact info placeholders (will be dynamic when fields are added to Organization type)
      pdf.setFontSize(8);
      pdf.text('🏠 Address', margin + 20, yPosition + 20);
      pdf.text('🌍 City, State, Zip', margin + 20, yPosition + 26);
      pdf.text('💼 Tax ID', margin + 20, yPosition + 32);

      // TO section (right side)
      const toStartX = margin + sectionWidth + 20;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...mediumGray);
      pdf.text('↙ TO', toStartX, yPosition - 8);
      
      // Only show client section if client exists
      if (invoice.client?.name) {
        // Client avatar (colored circle)
        pdf.setFillColor(254, 243, 199); // Light yellow background
        pdf.circle(toStartX + 8, yPosition + 8, 8, 'F');
        pdf.setTextColor(146, 64, 14); // Dark yellow text
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const clientName = invoice.client.name;
        const clientInitials = clientName.substring(0, 2).toUpperCase();
        pdf.text(clientInitials, toStartX + 8, yPosition + 10, { align: 'center' });
        
        // Client details
        pdf.setTextColor(...darkGray);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clientName, toStartX + 20, yPosition + 6);
        
        // Client contact info (placeholder for future fields)
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...mediumGray);
        pdf.text('Pay@client.com', toStartX + 20, yPosition + 12);
        
        // Contact info placeholders
        pdf.setFontSize(8);
        pdf.text('🏠 Address', toStartX + 20, yPosition + 20);
        pdf.text('🌍 City, State, Zip', toStartX + 20, yPosition + 26);
        pdf.text('💼 Tax ID', toStartX + 20, yPosition + 32);
      } else {
        // Placeholder if no client
        pdf.setFontSize(9);
        pdf.setTextColor(...mediumGray);
        pdf.text('Client information not available', toStartX + 20, yPosition + 6);
      }

      yPosition += 50;

      // Items Table
      // Table header
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...mediumGray);
      
      const colWidths = [90, 20, 30, 35]; // Description, QTY, Price, Amount
      const tableStartX = margin;
      
             pdf.text('Description', tableStartX, yPosition);
       pdf.text('QTY', tableStartX + (colWidths[0] ?? 0), yPosition, { align: 'right' });
       pdf.text('Price', tableStartX + (colWidths[0] ?? 0) + (colWidths[1] ?? 0), yPosition, { align: 'right' });
       pdf.text('Amount', tableStartX + (colWidths[0] ?? 0) + (colWidths[1] ?? 0) + (colWidths[2] ?? 0), yPosition, { align: 'right' });
      
      // Header underline
      pdf.setDrawColor(...lightGray);
      pdf.line(tableStartX, yPosition + 2, pageWidth - margin, yPosition + 2);
      
      yPosition += 10;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      
      if (invoice.invoice_items && invoice.invoice_items.length > 0) {
        invoice.invoice_items.forEach((item, _index) => {
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = margin;
          }

          // Colored indicator dot based on service type
          const isDesignWork = item.description.toLowerCase().includes('design');
          const dotColor = isDesignWork ? green : yellow;
          
          pdf.setFillColor(...dotColor);
          pdf.circle(tableStartX + 2, yPosition + 2, 1.5, 'F');
          
          // Item description
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...darkGray);
          const description = item.description.length > 45 ? 
            item.description.substring(0, 42) + '...' : item.description;
          pdf.text(description, tableStartX + 8, yPosition + 3);
          
          // Quantity, Price, Amount
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...mediumGray);
                     pdf.text(item.quantity.toString(), tableStartX + (colWidths[0] ?? 0), yPosition + 3, { align: 'right' });
           pdf.text(formatCurrency(item.unit_price, invoice.currency), tableStartX + (colWidths[0] ?? 0) + (colWidths[1] ?? 0), yPosition + 3, { align: 'right' });
           
           // Amount (bold and dark)
           pdf.setFont('helvetica', 'bold');
           pdf.setTextColor(...darkGray);
           pdf.text(formatCurrency(item.total_price ?? 0, invoice.currency), tableStartX + (colWidths[0] ?? 0) + (colWidths[1] ?? 0) + (colWidths[2] ?? 0), yPosition + 3, { align: 'right' });
          
          yPosition += 12;
        });
      }

      yPosition += 10;

      // Totals section (right-aligned)
      const totalsStartX = pageWidth - margin - 60;
      const subtotal = invoice.subtotal_amount ?? 0;
      // const taxAmount = invoice.tax_amount ?? 0;
      const discountAmount =  0;
      const total = invoice.total_amount ?? 0;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(...mediumGray);
      
      // Subtotal
      pdf.text('Subtotal', totalsStartX, yPosition);
      pdf.setTextColor(...darkGray);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(subtotal, invoice.currency), pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 8;

      // Discount (if exists)
      if (discountAmount > 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...mediumGray);
        pdf.text('Discount', totalsStartX, yPosition);
        pdf.setTextColor(...darkGray);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`-${formatCurrency(discountAmount, invoice.currency)}`, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 8;
      }

      // Total (larger and prominent)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(...darkGray);
      pdf.text('Total', totalsStartX, yPosition);
      pdf.text(formatCurrency(total, invoice.currency), pageWidth - margin, yPosition, { align: 'right' });

      yPosition += 25;

      // Signature section
      pdf.setFontSize(9);
      pdf.setTextColor(...mediumGray);
      pdf.text('Signature', margin, yPosition);
      
      yPosition += 8;
      
      // Signature line
      pdf.setDrawColor(...lightGray);
      pdf.line(margin, yPosition, margin + 50, yPosition);
      
      yPosition += 6;
      pdf.setFontSize(7);
      pdf.setTextColor(...lightGray);
      pdf.text('Authorized Signature', margin, yPosition);

      return pdf.output('blob');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('invoices:errors.failedToGeneratePDF'));
      throw error;
    }
  }, [t, formatCurrency, formatDate]);

  const downloadInvoicePDF = useCallback(async (
    invoice: Invoice.Response,
    options?: {
      companyLogo?: string;
      companyDetails?: InvoiceTemplate['companyDetails'];
      filename?: string;
    }
  ): Promise<void> => {
    try {
      const pdfBlob = await generateInvoicePDF(invoice, options);
      const filename = options?.filename ?? `invoice-${invoice.number}`;
      downloadPDF(pdfBlob, filename);
      
      toast.success(t('invoices:success.pdfDownloaded'));
    } catch (error) {
      console.error('Failed to download invoice PDF:', error);
    }
  }, [generateInvoicePDF, downloadPDF, t]);

  const previewInvoicePDF = useCallback(async (
    invoice: Invoice.Response,
    options?: {
      companyLogo?: string;
      companyDetails?: InvoiceTemplate['companyDetails'];
    }
  ): Promise<string> => {
    try {
      const pdfBlob = await generateInvoicePDF(invoice, options);
      return URL.createObjectURL(pdfBlob);
    } catch (error) {
      toast.error(t('invoices:errors.failedToPreviewPDF'));
      throw error;
    }
  }, [generateInvoicePDF, t]);

  return {
    generateInvoicePDF,
    downloadInvoicePDF,
    previewInvoicePDF,
    formatCurrency,
  };
}; 