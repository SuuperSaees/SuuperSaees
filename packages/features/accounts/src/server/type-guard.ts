import { Json } from "../../../../../apps/web/lib/database.types";

// Type definition for user_organization config
export interface UserOrganizationConfig {
  enable_credits: boolean;
}

export type CreditsConfig = {
  enable_credits: boolean;
};

// Type guard for user_organization config
export function isUserOrganizationConfig(value: unknown): value is UserOrganizationConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).enable_credits === 'boolean'
  );
}

export function isCreditsConfig(value: unknown): value is CreditsConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).enable_credits === 'boolean'
  );
}

// Helper function to parse and validate credits from JSON string or JSON object
  export function parseCreditsConfig(jsonString: string | null | undefined | object | Json): CreditsConfig | null { 
    if (!jsonString) {
      return null;
    }
    
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (isCreditsConfig(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing credits config:', error);
      return null;
    }
    return null;
  }


