// Main component
export { CatalogServiceCard } from './card';

// Sub-components (for testing or custom use)
export { 
  ServiceTrialBanner,
  ServiceTags,
  ServicePricing,
  ServiceCardActions,
  ServiceCardImage,
  ServiceCardContent
} from './card';

// Hooks
export { useServiceApiActions } from '../hooks/use-service-api-actions';

// Utilities and constants
export {
  canUserEditService,
  getServiceRecurrenceText,
  getServiceTags,
  shouldShowServiceTypeBadge,
  hasFreeTrial,
  isServiceAvailable,
  getServiceImageUrl,
  getServiceDescription,
  VALID_EDIT_ROLES,
  SERVICE_TAG_PRIORITIES,
  FALLBACK_SERVICE_IMAGE,
  CARD_DIMENSIONS,
  ANIMATION_CLASSES
} from '../lib/utils';

// Note: TAG_STYLES was removed - it's no longer exported from utils

// Types
export type {
  ServiceTag,
  RecurrenceText,
  CatalogServiceCardProps,
  ServiceCardImageProps,
  ServiceCardContentProps,
  ServiceCardActionsProps,
  ServiceTagsProps,
  ServicePricingProps,
  ServiceTrialBannerProps
} from '../types/index'; 