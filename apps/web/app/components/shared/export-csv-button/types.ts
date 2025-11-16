/**
 * Type for a value formatter function
 * Takes any value and returns a formatted string
 */
export type ValueFormatter = (value: unknown) => string;

/**
 * Type for pagination configuration
 */
export type PaginationConfig = {
  pageSize: number;
  currentPage: number;
}
/**
 * Generic type for data objects that can be exported to CSV
 */
export type ExportableData = Record<string, unknown>;

/**
 * Props for the ExportCSVButton component
 */
export interface ExportCSVButtonProps<T extends ExportableData> {
  /**
   * Array of data objects to export
   */
  data: T[];
  
  /**
   * Translation function
   */
  t: (key: string) => string;
  
  /**
   * Optional array of allowed column keys
   */
  allowedColumns?: string[];
  
  /**
   * Optional mapping of column keys to display names
   */
  columnHeaders?: Record<string, string>;
  
  /**
   * Optional default filename
   */
  defaultFilename?: string;
  
  /**
   * Optional default selected columns
   */
  defaultSelectedColumns?: string[];
  
  /**
   * Optional button text override
   */
  buttonText?: string;
  
  /**
   * Optional button variant
   */
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  /**
   * Optional class name for the button
   */
  className?: string;

  /**
   * Optional custom formatters for specific columns
   * This allows customizing how complex data types are formatted in the CSV
   */
  valueFormatters?: Record<string, ValueFormatter>;

  /**
   * Optional disabled state for the button
   */
  disabled?: boolean;

  /**
   * Optional pagination configuration
   */
  pagination?: PaginationConfig;
}

/**
 * Props for the export dialog component
 */
export interface ExportDialogProps<T extends ExportableData> {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  
  /**
   * Function to close the dialog
   */
  onClose: () => void;
  
  /**
   * Function to handle export
   */
  onExport: () => void;
  
  /**
   * Array of data objects to export
   */
  data: T[];
  
  /**
   * Translation function
   */
  t: (key: string) => string;
  
  /**
   * Available columns for export
   */
  availableColumns: string[];
  
  /**
   * Column headers mapping
   */
  columnHeaders: Record<string, string>;
  
  /**
   * Selected columns for export
   */
  selectedColumns: string[];
  
  /**
   * Function to set selected columns
   */
  setSelectedColumns: (columns: string[]) => void;
  
  /**
   * Filename for export
   */
  filename: string;
  
  /**
   * Function to set filename
   */
  setFilename: (filename: string) => void;
  
  /**
   * Delimiter for CSV
   */
  delimiter: string;
  
  /**
   * Function to set delimiter
   */
  setDelimiter: (delimiter: string) => void;
  
  /**
   * Whether to use pagination
   */
  usePagination: boolean;
  
  /**
   * Function to set pagination
   */
  setUsePagination: (usePagination: boolean) => void;
  
  /**
   * Page size for pagination
   */
  pageSize: number;
  
  /**
   * Function to set page size
   */
  setPageSize: (pageSize: number) => void;
  
  /**
   * Current page for pagination
   */
  currentPage: number;
  
  /**
   * Function to set current page
   */
  setCurrentPage: (currentPage: number) => void;
  
  /**
   * Function to format preview values
   */
  formatPreviewValue: (value: unknown, column?: string) => string;
}

/**
 * Props for the settings tab component
 */
export interface SettingsTabProps {
  /**
   * Translation function
   */
  t: (key: string) => string;
  
  /**
   * Filename for export
   */
  filename: string;
  
  /**
   * Function to set filename
   */
  setFilename: (filename: string) => void;
  
  /**
   * Delimiter for CSV
   */
  delimiter: string;
  
  /**
   * Function to set delimiter
   */
  setDelimiter: (delimiter: string) => void;
  
  /**
   * Whether to use pagination
   */
  usePagination: boolean;
  
  /**
   * Function to set pagination
   */
  setUsePagination: (usePagination: boolean) => void;
  
  /**
   * Page size for pagination
   */
  pageSize: number;
  
  /**
   * Function to set page size
   */
  setPageSize: (pageSize: number) => void;
  
  /**
   * Current page for pagination
   */
  currentPage: number;
  
  /**
   * Function to set current page
   */
  setCurrentPage: (currentPage: number) => void;
  
  /**
   * Available columns for export
   */
  availableColumns: string[];
  
  /**
   * Column headers mapping
   */
  columnHeaders: Record<string, string>;
  
  /**
   * Selected columns for export
   */
  selectedColumns: string[];
  
  /**
   * Function to handle column toggle
   */
  handleColumnToggle: (column: string) => void;
  
  /**
   * Function to handle select all columns
   */
  handleSelectAllColumns: () => void;
  
  /**
   * Function to handle clear all columns
   */
  handleClearAllColumns: () => void;

  /**
   * Total number of rows in the data
   */
  dataLength: number;
}

/**
 * Props for the preview tab component
 */
export interface PreviewTabProps<T extends ExportableData> {
  /**
   * Translation function
   */
  t: (key: string) => string;
  
  /**
   * Selected columns for export
   */
  selectedColumns: string[];
  
  /**
   * Column headers mapping
   */
  columnHeaders: Record<string, string>;
  
  /**
   * Function to get preview data
   */
  getPreviewData: () => T[];
  
  /**
   * Function to format preview values
   */
  formatPreviewValue: (value: unknown, column?: string) => string;
} 