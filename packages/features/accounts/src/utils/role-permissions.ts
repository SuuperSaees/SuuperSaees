export type UserRole = 
  | 'agency_owner'
  | 'agency_member' 
  | 'agency_project_manager'
  | 'client_owner'
  | 'client_member'
  | 'client_guest';

const CLIENT_ROLES = new Set(['client_member', 'client_owner', 'client_guest']);

export type TabName = 'site' | 'profile' | 'subscription' | 'invoices' | 'payments';

export type InvoiceSettingsSection = 
  | 'invoice_management'
  | 'require_complete_address'
  | 'automatic_note'
  | 'billing_information'
  | 'company_information'
  | 'business_address';

// Role-based access matrix for account settings tabs
export const ROLE_TAB_PERMISSIONS: Record<UserRole, TabName[]> = {
  agency_owner: ['site', 'profile', 'subscription', 'invoices', 'payments'],
  agency_member: ['profile'],
  agency_project_manager: ['profile'],
  client_owner: ['profile', 'invoices'],
  client_member: ['profile'],
  client_guest: ['profile'],
};

// Role-based access matrix for invoice settings sections
export const ROLE_INVOICE_PERMISSIONS: Record<UserRole, InvoiceSettingsSection[]> = {
  agency_owner: [
    'invoice_management',
    'require_complete_address', 
    'automatic_note',
    'billing_information',
    'company_information',
    'business_address'
  ],
  agency_member: [],
  agency_project_manager: [],
  client_owner: [
    'billing_information',
    'company_information', 
    'business_address'
  ],
  client_member: [],
  client_guest: [],
};

// Helper functions
export const canAccessTab = (role: UserRole, tab: TabName): boolean => {
  return ROLE_TAB_PERMISSIONS[role]?.includes(tab) ?? false;
};

export const canAccessInvoiceSection = (role: UserRole, section: InvoiceSettingsSection): boolean => {
  return ROLE_INVOICE_PERMISSIONS[role]?.includes(section) ?? false;
};

export const getAvailableTabs = (role: UserRole): TabName[] => {
  return ROLE_TAB_PERMISSIONS[role] ?? [];
};

export const getAvailableInvoiceSections = (role: UserRole): InvoiceSettingsSection[] => {
  return ROLE_INVOICE_PERMISSIONS[role] ?? [];
};

export const shouldShowTabsList = (role: UserRole): boolean => {
  // Hide tabs list for client_member and client_owner that only have basic access
  return !CLIENT_ROLES.has(role) || role === 'client_owner';
};

export const getDefaultTab = (role: UserRole): TabName => {
  const availableTabs = getAvailableTabs(role);
  if (availableTabs.includes('site')) return 'site';
  if (availableTabs.includes('profile')) return 'profile';
  return availableTabs[0] ?? 'profile';
}; 