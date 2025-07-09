"use client";

import Link from "next/link";
import {
  Users,
  ArrowRight,
  ShoppingCart,
  Clock,
  Shield,
  Eye,
  EyeOff,
  SquarePen,
} from "lucide-react";
import { Button } from "@kit/ui/button";
import { Trans } from "@kit/ui/trans";
import { formatCurrency } from "@kit/shared/utils";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Service } from "~/lib/services.types";
import { updateService } from "~/server/actions/services/update-services";
import { toast } from "sonner";
import Tooltip from "~/components/ui/tooltip";

interface CatalogServiceCardProps {
  userRole?: string | null;
  service: Service.Type;
  logoUrl?: string;
  themeColor?: string;
}

export default function CatalogServiceCard({
  service,
  logoUrl,
  userRole,
  themeColor,
}: CatalogServiceCardProps) {
  // Function to handle the visibility of the card in the catalog
  // Only available for agency roles
  const validRoles = ["agency_owner", "agency_project_manager"];
  const canEditService = validRoles.includes(userRole ?? "");

  const queryClient = useQueryClient();
  const updateServiceMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Service.Type["id"];
      data: Service.Update;
    }) => await updateService(id, data),
    onSuccess: () => {
      toast.success("Service updated successfully");
    },
    onError: () => {
      toast.error("Error updating service");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const handleVisibilityChange = () => {
    if (canEditService) {
      const newStatus = service.visibility === "public" ? "private" : "public";
      updateServiceMutation.mutate({
        id: service.id,
        data: { visibility: newStatus },
      });
    }
  };
  return (
    <div className="group relative flex h-fit w-full max-w-sm flex-col rounded-xl bg-white shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Container with Overlay Effects */}
      <div className="relative h-48 w-full overflow-hidden">
        {/* Status Badge */}
        {service.status === "active" && (
          <div className="absolute left-3 top-3 z-10 rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-800 shadow-sm">
            <Trans
              i18nKey="services:catalog.card.status.active"
              defaults="Active"
            />
          </div>
        )}

        {/* Service Type Badge */}
        <div className="absolute right-3 top-3 z-10 rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 shadow-sm">
          {service.single_sale === true ? (
            <Trans
              i18nKey="services:catalog.card.type.oneTime"
              defaults="One-time"
            />
          ) : service.recurring_subscription === true ? (
            <Trans
              i18nKey="services:catalog.card.type.subscription"
              defaults="Subscription"
            />
          ) : (
            <Trans
              i18nKey="services:catalog.card.type.service"
              defaults="Service"
            />
          )}
        </div>

        {/* Service Image */}
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src={service.service_image ?? "/images/fallbacks/service-1.png"}
          alt={service.name ?? "service"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Visibility Toggle Button - Only for valid roles */}
        {canEditService && (
          <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2">
            <Tooltip
              content={
                <Trans
                  i18nKey={`services:catalog.card.${service.visibility === "public" ? "hide" : "show"}`}
                  defaults={`${service.visibility === "public" ? "Hide from catalog" : "Show in catalog"}`}
                />
              }
            >
              <Button
                size="sm"
                onClick={handleVisibilityChange}
                disabled={updateServiceMutation.isPending}
                className="rounded-lg bg-white/95 text-gray-700 shadow-md hover:bg-white hover:shadow-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300"
              >
                {service.visibility === "public" ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </Tooltip>
            <Tooltip
              content={<Trans i18nKey="services:catalog.card.edit" defaults="Edit" />}
            >
            <Link
              href={`/services/update?id=${service.id}`}
              className="rounded-lg bg-white/95 text-gray-700 shadow-md hover:shadow-lg border border-gray-200 h-8 px-3 flex items-center justify-center hover:bg-gray-100 transition-all duration-300"
            >
              <SquarePen className="h-4 w-4" />
            </Link>
            </Tooltip>
          </div>
        )}

        {/* Quick Action Button */}
        {service.checkout_url && (
          <div className="absolute bottom-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Tooltip
              content={<Trans i18nKey="services:catalog.card.purchase" defaults="Get Started" />}
            >
            <Link href={service.checkout_url}>
              <Button
                size="sm"
                className="rounded-lg bg-white/95 text-gray-700 shadow-md hover:bg-white hover:shadow-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col p-6">
        {/* Service Name */}
        <h3 className="mb-2 text-xl font-bold leading-tight text-gray-900 line-clamp-1">
          {service.name}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2">
          {service.service_description ?? "No description available"}
        </p>

        {/* Client Info */}
        <div className="mb-4 flex items-center gap-4 text-xs text-gray-600">
          {service.number_of_clients && service.number_of_clients > 0 ? (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {service.number_of_clients}{" "}
                <Trans
                  i18nKey="services:catalog.card.clients.plural"
                  defaults="clients"
                />
              </span>
            </div>
          ) : null}

          {service.status === "active" && service.checkout_url && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="font-medium">
                <Trans
                  i18nKey="services:catalog.card.available"
                  defaults="Available now"
                />
              </span>
            </div>
          )}
        </div>

        {/* Features/Benefits */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <Clock className="h-3 w-3" />
            <Trans
              i18nKey="services:catalog.card.features.fast"
              defaults="Fast delivery"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Shield className="h-3 w-3" />
            <Trans
              i18nKey="services:catalog.card.features.guaranteed"
              defaults="Guaranteed"
            />
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(
                service?.currency?.toUpperCase() ?? "USD",
                service?.price ?? 0,
              )}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">
            {service.single_sale === true ? (
              <Trans
                i18nKey="services:catalog.card.pricing.oneTime"
                defaults="One-time payment"
              />
            ) : service.recurring_subscription === true ? (
              <Trans
                i18nKey="services:catalog.card.pricing.subscription"
                defaults="Monthly subscription"
              />
            ) : (
              <Trans
                i18nKey="services:catalog.card.pricing.contact"
                defaults="Contact for pricing"
              />
            )}
          </p>
        </div>

        {/* CTA Button */}
        {service.checkout_url ? (
          <Link href={service.checkout_url} className="w-full">
            <ThemedButton
              className="w-full font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group/btn"
              size="lg"
              themeColor={themeColor}
            >
              <span className="flex items-center justify-center gap-2">
                <Trans
                  i18nKey="services:catalog.card.purchase"
                  defaults="Get Started"
                />
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </ThemedButton>
          </Link>
        ) : (
          <Button
            className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
            size="lg"
            disabled
          >
            <Trans
              i18nKey="services:catalog.card.unavailable"
              defaults="Unavailable"
            />
          </Button>
        )}

        {/* Service Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <Trans
                i18nKey="services:catalog.card.features.professional"
                defaults="Professional service"
              />
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <Trans
                i18nKey="services:catalog.card.features.support"
                defaults="Support included"
              />
            </span>
          </div>

          {/* Company Logo */}
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="h-6 w-6 rounded object-contain opacity-60"
            />
          )}
        </div>
      </div>
    </div>
  );
}
