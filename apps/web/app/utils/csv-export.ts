/**
 * Options for CSV export
 */
export interface CSVExportOptions {
  /**
   * Selected columns to export
   */
  selectedColumns: string[];
  
  /**
   * Column headers mapping (key to display name)
   */
  columnHeaders: Record<string, string>;
  
  /**
   * Filename for the exported CSV
   */
  filename?: string;
  
  /**
   * Whether to include headers in the CSV
   */
  includeHeaders?: boolean;
  
  /**
   * Custom data transformer function
   */
  transformData?: (data: unknown) => unknown;
  
  /**
   * Pagination options
   */
  pagination?: {
    pageSize: number;
    currentPage: number;
  };
  
  /**
   * Delimiter to use (default is comma)
   */
  delimiter?: string;
}

/**
 * Default CSV export options
 */
const defaultCSVExportOptions: Partial<CSVExportOptions> = {
  filename: 'export.csv',
  includeHeaders: true,
  delimiter: ',',
};

/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert
 * @param options Export options
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVExportOptions
): string {
  const { 
    selectedColumns, 
    columnHeaders, 
    includeHeaders = true, 
    transformData,
    delimiter = ',' 
  } = { ...defaultCSVExportOptions, ...options };
  
  // Transform data if needed
  const processedData = transformData ? data.map(transformData) : data;
  
  // Create CSV rows
  const rows: string[] = [];
  
  // Add headers if needed
  if (includeHeaders) {
    const headerRow = selectedColumns
      .map(column => columnHeaders[column] ?? column)
      .map(value => escapeCSVValue(value, delimiter))
      .join(delimiter);
    rows.push(headerRow);
  }
  
  // Add data rows
  processedData.forEach((item) => {
    const row = selectedColumns
      .map(column => {
        // Type assertion since we know the structure matches Record<string, unknown>
        const typedItem = item as Record<string, unknown>;
        const value = typedItem[column];
        return escapeCSVValue(formatValue(value), delimiter);
      })
      .join(delimiter);
    rows.push(row);
  });
  
  return rows.join('\r\n');
}

/**
 * Formats a value for CSV export
 * @param value Value to format
 * @returns Formatted value
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join('; ');
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Escapes a value for CSV format
 * @param value Value to escape
 * @param delimiter The delimiter being used
 * @returns Escaped value
 */
function escapeCSVValue(value: string, delimiter: string): string {
  // Create a regex that includes the delimiter
  const pattern = new RegExp(`[${delimiter}"\n\r]`);
  
  // If the value contains the delimiter, quotes, or newlines, wrap it in quotes
  if (pattern.test(value)) {
    // Double up any quotes
    value = value.replace(/"/g, '""');
    // Wrap in quotes
    return `"${value}"`;
  }
  return value;
}

/**
 * Exports data as a CSV file
 * @param data Data to export
 * @param options Export options
 */
export function exportAsCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVExportOptions
): void {
  const { filename = 'export.csv', pagination, delimiter = ',' } = { 
    ...defaultCSVExportOptions, 
    ...options 
  };
  
  // Apply pagination if needed
  let dataToExport = data;
  if (pagination) {
    const { pageSize, currentPage } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    dataToExport = data.slice(startIndex, startIndex + pageSize);
  }
  
  try {
    // Generate CSV content
    const csv = convertToCSV(dataToExport, { ...options, delimiter });
    
    // Add BOM for Excel to properly recognize UTF-8
    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
    
    // Create a Blob with the CSV data
    const blob = new Blob([BOM, csv], { 
      type: delimiter === ',' 
        ? 'text/csv;charset=utf-8;' 
        : 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    
    // Add link to document
    document.body.appendChild(link);
    
    // Click the link to download the file
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    // Log the error
    console.error('Error exporting CSV:', err);
    
    // Fallback method if the above fails
    try {
      const csv = convertToCSV(dataToExport, { ...options, delimiter });
      const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent('\ufeff' + csv)}`;
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackErr) {
      console.error('Fallback CSV export also failed:', fallbackErr);
      alert('Failed to export CSV. Please try again or contact support.');
    }
  }
}

/**
 * Gets available columns from data
 * @param data Sample data to extract columns from
 * @returns Array of column keys
 */
export function getAvailableColumns<T extends Record<string, unknown>>(data: T[]): string[] {
  if (!data.length) return [];
  
  // Get all unique keys from all items
  const keysSet = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => keysSet.add(key));
  });
  
  return Array.from(keysSet);
} 