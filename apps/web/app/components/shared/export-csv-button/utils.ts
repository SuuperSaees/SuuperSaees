/**
 * Determines the best default delimiter based on user's locale
 * @returns The recommended delimiter for the user's locale
 */
export const getDefaultDelimiter = (): string => {
  // Regions that typically use semicolons in CSV files
  // These are countries that use comma as decimal separator
  const semicolonRegions = [
    'de', 'fr', 'it', 'es', 'pt', 'nl', 'be', 'dk', 'no',
    'se', 'fi', 'ru', 'pl', 'cz', 'sk', 'hu', 'ro', 'bg', 
    'hr', 'si', 'rs', 'tr',
  ];

  // Default to English locale
  let localePrefix = 'en';

  // Safely get browser locale
  if (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    navigator.language &&
    typeof navigator.language === 'string'
  ) {
    const parts = navigator.language.split('-');
    if (parts.length > 0 && parts[0]) {
      localePrefix = parts[0].toLowerCase();
    }
  }

  // Check if user's locale matches any semicolon region
  if (semicolonRegions.includes(localePrefix)) {
    return ';';
  }

  // Default to comma for other regions
  return ',';
};

/**
 * Format value for display in preview and export
 * @param value The value to format
 * @param column Optional column name for custom formatting
 * @param valueFormatters Optional custom formatters
 * @returns Formatted string value
 */
export const formatValue = (
  value: unknown, 
  column?: string,
  valueFormatters?: Record<string, (value: unknown) => string>
): string => {
  // If we have a custom formatter for this column and the column is provided, use it
  if (column && valueFormatters?.[column]) {
    return valueFormatters[column](value);
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      // For arrays, join the values with semicolons
      return value.map(item => {
        // If array items are objects, try to extract name or id
        if (item && typeof item === 'object') {
          return (item as Record<string, unknown>).name || 
                 (item as Record<string, unknown>).id || 
                 JSON.stringify(item);
        }
        return String(item);
      }).join('; ');
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // For objects, try to extract name or id if available
    const objValue = value as Record<string, unknown>;
    if (objValue?.name) {
      return String(objValue.name);
    }
    if (objValue?.id) {
      return String(objValue.id);
    }
    
    return JSON.stringify(value);
  }

  return String(value);
}; 