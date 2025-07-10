import { Service } from "~/lib/services.types";
import { ServiceTag, RecurrenceText } from "../lib/service-card";

export interface CatalogServiceCardProps {
  userRole?: string | null;
  service: Service.Type;
  logoUrl?: string;
  themeColor?: string;
}

export interface ServiceCardImageProps {
  service: Service.Type;
  serviceTags: ServiceTag[];
  userRole?: string | null;
}

export interface ServiceCardContentProps {
  service: Service.Type;
  serviceTags: ServiceTag[];
  recurrenceText: RecurrenceText | null;
  logoUrl?: string;
  themeColor?: string;
}

export interface ServiceCardActionsProps {
  service: Service.Type;
  userRole?: string | null;
}

export interface ServiceTagsProps {
  tags: ServiceTag[];
}

export interface ServicePricingProps {
  service: Service.Type;
  recurrenceText: RecurrenceText | null;
}

export interface ServiceTrialBannerProps {
  service: Service.Type;
}

// Re-export from lib for convenience
export type { ServiceTag, RecurrenceText } from "../lib/service-card"; 