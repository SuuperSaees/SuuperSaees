'use client';

import { useState, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';

import { DownloadIcon } from '@radix-ui/react-icons';

import { Button } from '@kit/ui/button';

import { exportAsCSV, getAvailableColumns } from '../../../utils/csv-export';
import { FileIcon } from '../file-icons';
import ExportDialog from './export-dialog';
import { ExportableData, ExportCSVButtonProps } from './types';
import { formatValue, getDefaultDelimiter } from './utils';

export interface ExportCSVButtonRef {
  openDialog: () => void;
}

/**
 * A reusable button component for exporting data to CSV format
 */
const ExportCSVButton = forwardRef<ExportCSVButtonRef, ExportCSVButtonProps<ExportableData>>(({
  ...props
}, ref) => {
  const {
  data,
  t,
  allowedColumns,
  columnHeaders: propColumnHeaders,
  defaultFilename = 'export.csv',
  defaultSelectedColumns,
  buttonText,
  buttonVariant = 'outline',
  className,
  valueFormatters,
  disabled = false,
  pagination,
} = props;
  // State for the export dialog
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filename, setFilename] = useState(defaultFilename);
  const [delimiter, setDelimiter] = useState(getDefaultDelimiter());
  const [usePagination, setUsePagination] = useState(false);
  const [pageSize, setPageSize] = useState(pagination?.pageSize ?? 100);
  const [currentPage, setCurrentPage] = useState(pagination?.currentPage ?? 1);

  // Get available columns from data, filtered by allowedColumns if provided
  const availableColumns = useMemo(() => {
    const columns = getAvailableColumns(data);
    
    // If allowedColumns is provided, filter the available columns
    if (allowedColumns && allowedColumns.length > 0) {
      return columns.filter(column => allowedColumns.includes(column));
    }
    
    return columns;
  }, [data, allowedColumns]);

  // Generate column headers based on available columns if not provided
  const columnHeaders = useMemo(() => {
    if (propColumnHeaders) {
      return propColumnHeaders;
    }

    // Create default column headers by capitalizing and formatting column names
    const headers: Record<string, string> = {};
    availableColumns.forEach(column => {
      // Convert snake_case or camelCase to Title Case
      const formatted = column
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^\w/, c => c.toUpperCase())
        .trim();
      
      headers[column] = formatted;
    });
    
    return headers;
  }, [availableColumns, propColumnHeaders]);

  // Initialize selected columns when dialog opens
  const handleOpenDialog = useCallback(() => {
    // Default to provided default columns, or some common ones if none selected yet
    if (selectedColumns.length === 0) {
      if (defaultSelectedColumns && defaultSelectedColumns.length > 0) {
        // Filter default columns by available columns
        const filteredDefaultColumns = defaultSelectedColumns.filter(col => 
          availableColumns.includes(col)
        );
        setSelectedColumns(filteredDefaultColumns);
      } else {
        // Try to select some common columns or just the first few
        const commonColumns = ['id', 'name', 'title', 'created_at', 'updated_at'];
        const filteredCommonColumns = commonColumns.filter(col => 
          availableColumns.includes(col)
        );
        
        if (filteredCommonColumns.length > 0) {
          setSelectedColumns(filteredCommonColumns);
        } else {
          // Just select the first few columns if no common ones are found
          setSelectedColumns(availableColumns.slice(0, Math.min(5, availableColumns.length)));
        }
      }
    }
    setIsOpen(true);
  }, [selectedColumns, defaultSelectedColumns, availableColumns]);

  // Expose the openDialog method to parent components
  useImperativeHandle(ref, () => ({
    openDialog: handleOpenDialog
  }), [handleOpenDialog]);

  // Format value for display in preview and export
  const formatPreviewValue = (value: unknown, column?: string): string => {
    return formatValue(value, column, valueFormatters);
  };

  // Handle export
  const handleExport = () => {
    // Validate that at least one column is selected
    if (selectedColumns.length === 0) {
      alert(t('export.selectAtLeastOneColumn'));
      return;
    }

    // Create a custom transformer function that applies our formatters
    const transformData = (item: unknown): Record<string, string> => {
      const result: Record<string, string> = {};
      const typedItem = item as Record<string, unknown>;
      
      selectedColumns.forEach(column => {
        const value = typedItem[column];
        result[column] = formatPreviewValue(value, column);
      });
      
      return result;
    };

    // Export the data
    exportAsCSV(data, {
      selectedColumns,
      columnHeaders,
      filename,
      delimiter,
      pagination: usePagination ? { pageSize, currentPage } : undefined,
      transformData,
    });

    // Close the dialog
    setIsOpen(false);
  };

  return (
    <>
      <Button
        disabled={disabled}
        variant={buttonVariant}
        className={`flex items-center gap-2 text-gray-600 ${className ?? ''}`}
        onClick={handleOpenDialog}
      >
        <div className="flex items-center gap-2 relative">
          <FileIcon extension="csv" size="xs" className="text-emerald-500" />
          <DownloadIcon className="h-3.5 w-3.5 text-emerald-600 absolute -right-1 -bottom-1" />
        </div>
        <span className="text-sm font-medium">
          {buttonText ?? t('export.exportCSV')}
        </span>
      </Button>

      <ExportDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onExport={handleExport}
        data={data}
        t={t}
        availableColumns={availableColumns}
        columnHeaders={columnHeaders}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        filename={filename}
        setFilename={setFilename}
        delimiter={delimiter}
        setDelimiter={setDelimiter}
        usePagination={usePagination}
        setUsePagination={setUsePagination}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        formatPreviewValue={formatPreviewValue}
      />
    </>
  );
});

ExportCSVButton.displayName = 'ExportCSVButton';

export default ExportCSVButton; 