// Type definition for user_organization config
export interface UserOrganizationConfig {
  enable_credits: boolean;
}

// Type guard for user_organization config
export function isUserOrganizationConfig(value: unknown): value is UserOrganizationConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).enable_credits === 'boolean'
  );
}
