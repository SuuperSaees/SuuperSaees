"use client";

import { CatalogServiceCardProps } from "../../types/service-card";
import { ServiceTrialBanner } from "./trial-banner";
import { ServiceCardImage } from "./image";
import { ServiceCardContent } from "./content";
import { getServiceTags, getServiceRecurrenceText, ANIMATION_CLASSES } from "../../lib/service-card";

/**
 * A modern, responsive service card component for the catalog.
 * 
 * Features:
 * - Responsive design with hover effects
 * - Trial period highlighting for conversion
 * - Role-based editing capabilities
 * - Optimized pricing display
 * - Professional service badges
 * 
 * @param service - The service data to display
 * @param logoUrl - Optional company logo URL
 * @param userRole - User's role for determining edit permissions
 * @param themeColor - Optional theme color for buttons
 */
export function CatalogServiceCard({
  service,
  logoUrl,
  userRole,
  themeColor,
}: CatalogServiceCardProps) {
  // Calculate derived data using utilities
  const serviceTags = getServiceTags(service);
  const recurrenceText = getServiceRecurrenceText(service);

  return (
    <div className={`group relative flex h-fit w-full max-w-sm flex-col rounded-xl bg-white shadow-md border border-gray-100 ${ANIMATION_CLASSES.CARD_HOVER}`}>
      {/* Trial Banner - Prominent placement for conversion */}
      <ServiceTrialBanner service={service} />

      {/* Image Section with Badges and Actions */}
      <ServiceCardImage 
        service={service} 
        serviceTags={serviceTags} 
        userRole={userRole} 
      />

      {/* Content Section */}
      <ServiceCardContent
        service={service}
        serviceTags={serviceTags}
        recurrenceText={recurrenceText}
        logoUrl={logoUrl}
        themeColor={themeColor}
      />
    </div>
  );
} 