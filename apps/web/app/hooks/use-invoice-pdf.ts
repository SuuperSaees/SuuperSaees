"use client";

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePDFManager } from './use-pdf-manager';
import { Invoice } from '~/lib/invoice.types';

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

  // Helper function to load and process images with circular clipping
  const loadImageWithFallback = useCallback(async (imageUrl?: string | null): Promise<string | null> => {
    if (!imageUrl) return null;
    
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Set timeout to avoid hanging
        const timeout = setTimeout(() => {
          resolve(null);
        }, 5000); // 5 second timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          
          // Create canvas for circular clipping
          const size = 200; // Higher resolution for better quality
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(null);
            return;
          }
          
          canvas.width = size;
          canvas.height = size;
          
          // Create circular clipping path
          ctx.beginPath();
          ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
          ctx.clip();
          
          // Calculate dimensions to maintain aspect ratio within circle
          const aspectRatio = img.width / img.height;
          let drawWidth = size;
          let drawHeight = size;
          let offsetX = 0;
          let offsetY = 0;
          
          if (aspectRatio > 1) {
            // Image is wider than tall
            drawHeight = size / aspectRatio;
            offsetY = (size - drawHeight) / 2;
          } else {
            // Image is taller than wide
            drawWidth = size * aspectRatio;
            offsetX = (size - drawWidth) / 2;
          }
          
          // Draw the image with proper aspect ratio
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        
        img.src = imageUrl;
      });
    } catch {
      return null;
    }
  }, []);

  const generateInvoicePDF = useCallback(async (
    invoice: Invoice.Response,
  ): Promise<Blob> => {
    try {
      const { jsPDF } = await import('jspdf');
      
      // Load logos with fallback
      const [agencyLogo, clientLogo] = await Promise.all([
        loadImageWithFallback(invoice.agency?.picture_url),
        loadImageWithFallback(invoice.client?.picture_url),
      ]);
      
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

      // Header Section - Horizontal Layout like Dribbble design
      // Left side - Company logo
      const logoSize = 10;
      const companyName = invoice.agency?.name ?? '';
      
      if (agencyLogo) {
        // Use actual agency logo (already processed with circular clipping)
        pdf.addImage(agencyLogo, 'PNG', margin, yPosition, logoSize, logoSize);
      } else {
        // Fallback to initials
        pdf.setFillColor(...darkGray);
        pdf.roundedRect(margin, yPosition, logoSize, logoSize, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        const companyInitials = companyName.substring(0, 2).toUpperCase();
        pdf.text(companyInitials, margin + logoSize/2, yPosition + 7, { align: 'center' });
      }

      // Right side - Invoice meta info in horizontal layout (with better spacing)
      const rightSideX = pageWidth - margin - 150; // Increased space for better layout
      
      // Invoice Number
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      pdf.text('Invoice Number', rightSideX, yPosition + 2);
      pdf.setTextColor(...darkGray);
      pdf.setFont('helvetica', 'bold');
      pdf.text(invoice.number, rightSideX, yPosition + 8);
      
      // Issued Date (more spacing)
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      pdf.text('Issued', rightSideX + 55, yPosition + 2);
      pdf.setTextColor(...darkGray);
      pdf.setFont('helvetica', 'bold');
      const issuedDate = invoice.created_at ? formatDate(invoice.created_at) : formatDate(new Date().toISOString());
      pdf.text(issuedDate, rightSideX + 55, yPosition + 8);
      
      // Due Date (only if available, with more spacing)
      if (invoice.due_date) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...mediumGray);
        pdf.text('Due Date', rightSideX + 110, yPosition + 2);
        pdf.setTextColor(...darkGray);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatDate(invoice.due_date), rightSideX + 110, yPosition + 8);
      }

      yPosition += 25;

      // From/To Section with direction indicators
      const sectionWidth = (pageWidth - 2 * margin - 20) / 2;
      
      // FROM section
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...mediumGray);
      pdf.text('FROM', margin, yPosition);
      
      yPosition += 8;
      
      // Company logo/avatar
      const avatarSize = 16;
      if (agencyLogo) {
        // Use actual agency logo (already processed with circular clipping)
        pdf.addImage(agencyLogo, 'PNG', margin, yPosition, avatarSize, avatarSize);
      } else {
        // Fallback to initials circle
        pdf.setFillColor(...darkGray);
        pdf.circle(margin + avatarSize/2, yPosition + avatarSize/2, avatarSize/2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const companyInitials = companyName.substring(0, 2).toUpperCase();
        pdf.text(companyInitials, margin + avatarSize/2, yPosition + avatarSize/2 + 2, { align: 'center' });
      }
      
      // Company details
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(companyName, margin + 20, yPosition + 6);
      
      // Additional agency info (placeholder for future fields)
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      pdf.text(invoice.agency?.owner?.email ?? '', margin + 20, yPosition + 12);
      
      // Contact info placeholders (will be dynamic when fields are added to Organization type)
      pdf.setFontSize(8);
      pdf.text(invoice.agency?.address ?? '', margin + 20, yPosition + 20);
      pdf.text(`${invoice.agency?.city ?? ''}, ${invoice.agency?.state ?? ''}, ${invoice.agency?.zip ?? ''}`, margin + 20, yPosition + 26);
      pdf.text(invoice.agency?.tax_id ?? '', margin + 20, yPosition + 32);

      // TO section (right side)
      const toStartX = margin + sectionWidth + 20;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...mediumGray);
      pdf.text('TO', toStartX, yPosition - 8);
      
      // Only show client section if client exists
      if (invoice.client?.name) {
        const clientName = invoice.client.name;
        
        // Client logo/avatar
        if (clientLogo) {
          // Use actual client logo (already processed with circular clipping)
          pdf.addImage(clientLogo, 'PNG', toStartX, yPosition, avatarSize, avatarSize);
        } else {
          // Fallback to initials circle
          pdf.setFillColor(254, 243, 199); // Light yellow background
          pdf.circle(toStartX + avatarSize/2, yPosition + avatarSize/2, avatarSize/2, 'F');
          pdf.setTextColor(146, 64, 14); // Dark yellow text
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          const clientInitials = clientName.substring(0, 2).toUpperCase();
          pdf.text(clientInitials, toStartX + avatarSize/2, yPosition + avatarSize/2 + 2, { align: 'center' });
        }
        
        // Client details
        pdf.setTextColor(...darkGray);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clientName, toStartX + 20, yPosition + 6);
        
        // Client contact info (placeholder for future fields)
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...mediumGray);
        pdf.text(invoice.client?.owner?.email ?? '', toStartX + 20, yPosition + 12);
        
        // Contact info placeholders
        pdf.setFontSize(8);
        pdf.text(invoice.client?.address ?? '', toStartX + 20, yPosition + 20);
        pdf.text(`${invoice.client?.settings?.city ?? ''}, ${invoice.client?.settings?.state ?? ''}, ${invoice.client?.zip ?? ''}`, toStartX + 20, yPosition + 26);
        pdf.text(invoice.client?.tax_id ?? '', toStartX + 20, yPosition + 32);
      } else {
        // Placeholder if no client
        pdf.setFontSize(9);
        pdf.setTextColor(...mediumGray);
        pdf.text('Client information not available', toStartX + 20, yPosition + 6);
      }

      yPosition += 50;

      // Items Table
      // Table header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...mediumGray);
      
      // Calculate column widths to span full width and align with totals
      const tableStartX = margin;
      const tableWidth = pageWidth - 2 * margin;
      const qtyColWidth = 20;
      const priceColWidth = 35;
      const amountColWidth = 50;
      const descriptionColWidth = tableWidth - qtyColWidth - priceColWidth - amountColWidth;
      
      // Column positions
      const qtyColX = tableStartX + descriptionColWidth;
      const priceColX = qtyColX + qtyColWidth;
      const amountColX = priceColX + priceColWidth;
      
      pdf.text('Description', tableStartX, yPosition);
      pdf.text('QTY', qtyColX, yPosition, { align: 'center' });
      pdf.text('Price', priceColX, yPosition, { align: 'center' });
      pdf.text('Amount', amountColX + amountColWidth, yPosition, { align: 'right' });
      
      // Header underline
      pdf.setDrawColor(...lightGray);
      pdf.line(tableStartX, yPosition + 2, pageWidth - margin, yPosition + 2);
      
      yPosition += 10;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      
      if (invoice.invoice_items && invoice.invoice_items.length > 0) {
        invoice.invoice_items.forEach((item, _index) => {
          // Check if we need a new page (leaving more space for totals section)
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = margin;
            
            // Re-draw table header on new page
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...mediumGray);
            
            pdf.text('Description', tableStartX, yPosition);
            pdf.text('QTY', qtyColX, yPosition, { align: 'center' });
            pdf.text('Price', priceColX, yPosition, { align: 'center' });
            pdf.text('Amount', amountColX + amountColWidth, yPosition, { align: 'right' });
            
            // Header underline
            pdf.setDrawColor(...lightGray);
            pdf.line(tableStartX, yPosition + 2, pageWidth - margin, yPosition + 2);
            
            yPosition += 10;
          }

          // Item description (no colored dots)
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...darkGray);
          const description = item.description.length > 50 ? 
            item.description.substring(0, 47) + '...' : item.description;
          pdf.text(description, tableStartX, yPosition + 3);
          
          // Quantity, Price, Amount
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...mediumGray);
          pdf.text(item.quantity.toString(), qtyColX, yPosition + 3, { align: 'center' });
          pdf.text(formatCurrency(item.unit_price, invoice.currency), priceColX, yPosition + 3, { align: 'center' });
           
          // Amount (bold and dark)
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...darkGray);
          pdf.text(formatCurrency(item.total_price ?? 0, invoice.currency), amountColX + amountColWidth, yPosition + 3, { align: 'right' });
          
          yPosition += 12;
        });
      }

      yPosition += 10;

      // Check if totals section needs a new page
      const totalsHeight = 50; // Estimated height for totals section
      if (yPosition > pageHeight - totalsHeight) {
        pdf.addPage();
        yPosition = margin;
      }

      // Totals section (aligned with Amount column)
      const totalsStartX = amountColX;
      const totalsValueX = amountColX + amountColWidth;
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
      pdf.text(formatCurrency(subtotal, invoice.currency), totalsValueX, yPosition, { align: 'right' });
      yPosition += 8;

      // Discount (if exists)
      if (discountAmount > 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...mediumGray);
        pdf.text('Discount', totalsStartX, yPosition);
        pdf.setTextColor(...darkGray);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`-${formatCurrency(discountAmount, invoice.currency)}`, totalsValueX, yPosition, { align: 'right' });
        yPosition += 8;
      }

      // Total (larger and prominent)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(...darkGray);
      pdf.text('Total', totalsStartX, yPosition);
      pdf.text(formatCurrency(total, invoice.currency), totalsValueX, yPosition, { align: 'right' });

      return pdf.output('blob');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('invoices:errors.failedToGeneratePDF'));
      throw error;
    }
  }, [t, formatCurrency, formatDate, loadImageWithFallback]);

  const downloadInvoicePDF = useCallback(async (
    invoice: Invoice.Response,
  ): Promise<void> => {
    try {
      const pdfBlob = await generateInvoicePDF(invoice);
      const filename = `${invoice.number}`;
      downloadPDF(pdfBlob, filename);
      
      toast.success(t('invoices:success.pdfDownloaded'));
    } catch (error) {
      console.error('Failed to download invoice PDF:', error);
    }
  }, [generateInvoicePDF, downloadPDF, t]);

  const previewInvoicePDF = useCallback(async (
    invoice: Invoice.Response,
  ): Promise<string> => {
    try {
      const pdfBlob = await generateInvoicePDF(invoice);
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