"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Service } from "~/lib/services.types";
import { updateService } from "~/server/actions/services/update-services";

/**
 * Generic hook for service API actions following the established pattern.
 * Handles any service update operation with consistent error handling and cache invalidation.
 */
export function useServiceApiActions() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["responses", "common"]);
  const updateServiceMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Service.Type["id"];
      data: Service.Update;
    }) => await updateService(id, data),
    onSuccess: () => {
      toast.success(t("common:success"), {
        description: t("responses:success.services.serviceUpdated"),
      });
    },
    onError: () => {
      toast.error(t("common:error"), {
        description: t("responses:error.services.failedToUpdateService"),
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    updateService: updateServiceMutation,
    isLoading: updateServiceMutation.isPending,
  };
} 