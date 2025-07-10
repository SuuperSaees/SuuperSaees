import {
  Clock,
  Calendar,
  Award,
  Gift,
  Repeat,
} from "lucide-react";
import { Service } from "~/lib/services.types";

export interface ServiceTag {
  icon: typeof Clock;
  bgColor: string;
  textColor: string;
  key: string;
  defaults: string;
  priority: number;
}

export interface RecurrenceText {
  key: string;
  defaults: string;
}

// Constants
export const VALID_EDIT_ROLES = ["agency_owner", "agency_project_manager"] as const;

export const SERVICE_TAG_PRIORITIES = {
  TRIAL: 1,
  BILLING_MODEL: 2,
  SERVICE_TYPE: 3,
} as const;



export const FALLBACK_SERVICE_IMAGE = "/images/fallbacks/service-1.png";

export const CARD_DIMENSIONS = {
  IMAGE_HEIGHT: "h-48",
  MAX_TAGS: 2,
} as const;

export const ANIMATION_CLASSES = {
  CARD_HOVER: "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
  IMAGE_HOVER: "transition-transform duration-300 group-hover:scale-110",
  BUTTON_HOVER: "transition-all duration-300",
  OVERLAY_FADE: "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
} as const;

/**
 * Determines if user can edit service based on their role
 */
export function canUserEditService(userRole?: string | null): boolean {
  if (!userRole) return false;
  return (VALID_EDIT_ROLES as readonly string[]).includes(userRole);
}

/**
 * Gets the appropriate recurrence text for a service
 */
export function getServiceRecurrenceText(service: Service.Type): RecurrenceText | null {
  if (!service.recurring_subscription) return null;

  switch (service.recurrence) {
    case "day":
      return {
        key: "services:catalog.card.pricing.daily",
        defaults: "Daily billing",
      };
    case "week":
      return {
        key: "services:catalog.card.pricing.weekly",
        defaults: "Weekly billing",
      };
    case "month":
      return {
        key: "services:catalog.card.pricing.monthly",
        defaults: "Monthly billing",
      };
    case "year":
      return {
        key: "services:catalog.card.pricing.yearly",
        defaults: "Yearly billing",
      };
    default:
      return {
        key: "services:catalog.card.pricing.subscription",
        defaults: "Subscription",
      };
  }
}

/**
 * Generates focused service tags, avoiding redundancy and prioritizing conversion drivers
 */
export function getServiceTags(service: Service.Type): ServiceTag[] {
  const tags: ServiceTag[] = [];

  // Prioritize trial period as it's a conversion driver
  if (service.test_period) {
    const trialText = service.test_period_duration
      ? `${service.test_period_duration} ${service.test_period_duration_unit_of_measurement}`
      : "trial";

    tags.push({
      icon: Gift,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      key: "services:catalog.card.features.freeTrial",
      defaults: `Free ${trialText}`,
      priority: SERVICE_TAG_PRIORITIES.TRIAL,
    });
  }

  // Time-based or credit-based (more specific than service type)
  if (service.time_based && service.hours) {
    tags.push({
      icon: Clock,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      key: "services:catalog.card.features.hoursIncluded",
      defaults: `${service.hours}h included`,
      priority: SERVICE_TAG_PRIORITIES.BILLING_MODEL,
    });
  } else if (service.credit_based && service.credits) {
    tags.push({
      icon: Award,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      key: "services:catalog.card.features.creditsIncluded",
      defaults: `${service.credits} credits`,
      priority: SERVICE_TAG_PRIORITIES.BILLING_MODEL,
    });
  }

  // Only show service type if no specific billing model
  if (!service.time_based && !service.credit_based) {
    if (service.recurring_subscription) {
      tags.push({
        icon: Repeat,
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-700",
        key: "services:catalog.card.features.subscription",
        defaults: "Recurring",
        priority: SERVICE_TAG_PRIORITIES.SERVICE_TYPE,
      });
    } else if (service.single_sale) {
      tags.push({
        icon: Calendar,
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        key: "services:catalog.card.features.oneTime",
        defaults: "One-time",
        priority: SERVICE_TAG_PRIORITIES.SERVICE_TYPE,
      });
    }
  }

  // Sort by priority and return max tags
  return tags
    .sort((a, b) => a.priority - b.priority)
    .slice(0, CARD_DIMENSIONS.MAX_TAGS);
}

/**
 * Checks if service type badge should be shown (avoiding redundancy with tags)
 */
export function shouldShowServiceTypeBadge(serviceTags: ServiceTag[]): boolean {
  return !serviceTags.some(
    (tag) =>
      tag.key.includes("subscription") || tag.key.includes("oneTime"),
  );
}

/**
 * Determines if service has a free trial
 */
export function hasFreeTrial(service: Service.Type): boolean {
  return service.test_period === true && service.test_period_price === 0;
}

/**
 * Checks if service is available for purchase
 */
export function isServiceAvailable(service: Service.Type): boolean {
  return service.status === "active" && Boolean(service.checkout_url);
}

/**
 * Gets the service image URL with fallback
 */
export function getServiceImageUrl(service: Service.Type): string {
  return service.service_image ?? FALLBACK_SERVICE_IMAGE;
}

/**
 * Gets the service description with fallback
 */
export function getServiceDescription(service: Service.Type): string {
  return service.service_description ?? "No description available";
} 