// Type definitions for invoice settings
export type InvoiceSettingsInformation = {
  company_name: string;
  address_1: string;
  address_2: string;
  country: string;
  postal_code: string;
  city: string;
  state: string;
  tax_id_type: string;
  tax_id_number: string;
};

export type InvoiceSettingsNote = {
  enabled: boolean;
  content: string;
};

export type InvoiceSettingsInvoices = {
  enabled: boolean;
  require_complete_address: boolean;
  note: InvoiceSettingsNote;
};

export type InvoiceSettings = {
  information: InvoiceSettingsInformation;
  invoices: InvoiceSettingsInvoices;
};

// Type guards for runtime validation
export function isInvoiceSettingsInformation(value: unknown): value is InvoiceSettingsInformation {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof obj.company_name === 'string' &&
    typeof obj.address_1 === 'string' &&
    typeof obj.address_2 === 'string' &&
    typeof obj.country === 'string' &&
    typeof obj.postal_code === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.tax_id_type === 'string' &&
    typeof obj.tax_id_number === 'string'
  );
}

export function isInvoiceSettingsNote(value: unknown): value is InvoiceSettingsNote {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof obj.enabled === 'boolean' &&
    typeof obj.content === 'string'
  );
}

export function isInvoiceSettingsInvoices(value: unknown): value is InvoiceSettingsInvoices {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof obj.enabled === 'boolean' &&
    typeof obj.require_complete_address === 'boolean' &&
    isInvoiceSettingsNote(obj.note)
  );
}

export function isInvoiceSettings(value: unknown): value is InvoiceSettings {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    isInvoiceSettingsInformation(obj.information) &&
    isInvoiceSettingsInvoices(obj.invoices)
  );
}

// Helper function to parse and validate invoice settings from JSON string
export function parseInvoiceSettings(jsonString: string | null | undefined): InvoiceSettings | null {
  if (!jsonString) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonString);
    
    if (isInvoiceSettings(parsed)) {
      return parsed;
    }
    
    console.warn('Invalid invoice settings structure:', parsed);
    return null;
  } catch (error) {
    console.error('Error parsing invoice settings JSON:', error);
    return null;
  }
}

// Helper function to get safe default values
export function getDefaultInvoiceSettings(): InvoiceSettings {
  return {
    information: {
      company_name: '',
      address_1: '',
      address_2: '',
      country: '',
      postal_code: '',
      city: '',
      state: '',
      tax_id_type: '',
      tax_id_number: '',
    },
    invoices: {
      enabled: true,
      require_complete_address: false,
      note: {
        enabled: false,
        content: '',
      },
    },
  };
}

// Helper function to safely merge with defaults
export function mergeWithDefaults(
  parsed: Partial<InvoiceSettings> | null
): InvoiceSettings {
  const defaults = getDefaultInvoiceSettings();
  
  if (!parsed) {
    return defaults;
  }

  return {
    information: {
      ...defaults.information,
      ...(parsed.information ?? {}),
    },
    invoices: {
      ...defaults.invoices,
      ...(parsed.invoices ?? {}),
      note: {
        ...defaults.invoices.note,
        ...(parsed.invoices?.note ?? {}),
      },
    },
  };
} 