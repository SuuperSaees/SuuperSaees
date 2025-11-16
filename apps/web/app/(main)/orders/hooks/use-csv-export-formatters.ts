import { useTranslation } from 'react-i18next';

/**
 * useCSVExportFormatters
 * 
 * This hook provides a centralized way to format complex data types for CSV export.
 * It handles common formatting needs such as:
 * - Converting arrays of objects to comma-separated strings of names
 * - Extracting names from object references
 * - Formatting dates in a localized way
 * - Mapping IDs to human-readable names for statuses and priorities
 * 
 * Usage:
 * ```tsx
 * // Basic usage
 * const { getValueFormatters } = useCSVExportFormatters(statuses, priorities);
 * 
 * // In your component
 * <ExportCSVButton
 *   data={data}
 *   valueFormatters={getValueFormatters()}
 *   // other props...
 * />
 * 
 * // With custom formatters
 * const { getValueFormatters } = useCSVExportFormatters(
 *   statuses,
 *   priorities,
 *   {
 *     // Override or add custom formatters
 *     title: (value) => `Project: ${String(value ?? '')}`
 *   }
 * );
 * 
 * // Creating custom formatters dynamically
 * const { getValueFormatters, createCustomFormatter } = useCSVExportFormatters(statuses, priorities);
 * const customFormatters = createCustomFormatter('title', (value) => `Project: ${String(value ?? '')}`);
 * ```
 */

/**
 * Type for a value formatter function
 * Takes any value and returns a formatted string
 */
export type ValueFormatter = (value: unknown) => string;

/**
 * Type for the object containing all value formatters
 */
export type ValueFormatters = Record<string, ValueFormatter>;

/**
 * Type for status objects
 */
interface Status {
  id: string | number;
  status_name: string | null;
  status_color: string | null;
}

/**
 * Type for priority objects
 */
interface Priority {
  id: string;
  name: string;
  color: string;
}

/**
 * Hook to provide value formatters for CSV export
 * 
 * This hook centralizes the logic for formatting complex data types
 * when exporting to CSV, making the code more maintainable and reusable.
 * 
 * @param statuses - Array of status objects with id, status_name, and status_color
 * @param priorities - Array of priority objects with id, name, and color
 * @param customFormatters - Optional object with custom formatters that will override the defaults
 * @returns Object with getValueFormatters function that returns formatter functions
 */
const useCSVExportFormatters = (
  statuses: Status[],
  priorities: Priority[],
  customFormatters?: Partial<ValueFormatters>
) => {
  const { t } = useTranslation('orders');

  /**
   * Helper function to format object fields to show just the name
   * 
   * @param value - The value to format
   * @returns Formatted string with just the name or original value
   */
  const formatObjectName: ValueFormatter = (value) => {
    if (value && typeof value === 'object') {
      return String((value as Record<string, unknown>).name ?? '');
    }
    return String(value ?? '');
  };

  /**
   * Helper function to format dates
   * 
   * @param value - The value to format
   * @returns Formatted date string or original value
   */
  const formatDate: ValueFormatter = (value) => {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === 'string') {
      try {
        const date = new Date(value);
        // Check if the date is valid
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (e) {
        // If date parsing fails, return the original value
      }
    }
    return String(value ?? '');
  };

  /**
   * Returns an object with formatter functions for each column type
   * 
   * @returns Object mapping column names to formatter functions
   */
  const getValueFormatters = (): ValueFormatters => {
    // Default formatters
    const defaultFormatters: ValueFormatters = {
      // Format assigned_to array to show just the names
      assigned_to: (value) => {
        if (Array.isArray(value)) {
          return value
            .map(item => {
              // Handle the structure where each item has an agency_member property
              if (item && typeof item === 'object') {
                const agencyMember = (item as Record<string, unknown>).agency_member;
                if (agencyMember && typeof agencyMember === 'object') {
                  return String((agencyMember as Record<string, unknown>).email ?? '');
                }
                // Fallback to the original logic for backward compatibility
                return (item as Record<string, unknown>).name 
                  ? String((item as Record<string, unknown>).name) 
                  : String(item);
              }
              return String(item);
            })
            .filter(Boolean)
            .join(', ');
        }
        return String(value ?? '');
      },
      
      // Format object fields to show just the name
      customer: formatObjectName,
      client_organization: formatObjectName,
      agency: formatObjectName,
      
      // Format status to show the status name instead of ID
      status: (value) => {
        const statusObj = statuses.find(s => s.id === (value as Status).id);
        return statusObj ? statusObj.status_name ?? String(value) : String(value ?? '');
      },
      
      // Format priority to show the priority name
      priority: (value) => {
        const priorityObj = priorities.find(p => p.id === value);
        return priorityObj ? t(`details.priorities.${priorityObj.name}`) : String(value ?? '');
      },
      
      // Format dates to be more readable
      created_at: formatDate,
      updated_at: formatDate,
      due_date: formatDate,
    };

    // Merge default formatters with custom formatters (custom ones take precedence)
    if (!customFormatters) {
      return defaultFormatters;
    }
    
    // Filter out any undefined formatters
    const safeCustomFormatters: ValueFormatters = Object.entries(customFormatters)
      .filter(([_, formatter]) => formatter !== undefined)
      .reduce((acc, [key, formatter]) => {
        acc[key] = formatter as ValueFormatter;
        return acc;
      }, {} as ValueFormatters);
    
    return { ...defaultFormatters, ...safeCustomFormatters };
  };

  /**
   * Creates a custom formatter for a specific column
   * 
   * @param column - The column name to create a formatter for
   * @param formatter - The formatter function
   * @returns A new object with the custom formatter
   */
  const createCustomFormatter = (column: string, formatter: ValueFormatter): Partial<ValueFormatters> => {
    return {
      [column]: formatter,
    };
  };

  return {
    getValueFormatters,
    createCustomFormatter,
  };
};

export default useCSVExportFormatters; 