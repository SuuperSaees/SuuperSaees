import { Input } from "@kit/ui/input";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCredit,
  getCredit,
} from "~/server/actions/credits/credits.action";
import { CreditOperations } from "~/lib/credit.types";
import { toast } from "sonner";
import { updateOrder } from "~/team-accounts/src/server/actions/orders/update/update-order";
import { Order } from "~/lib/order.types";
import { CreditIcon } from "~/components/icons/icons";
import { useRef } from "react";
import { cn } from "@kit/ui/utils";

const creditsSchema = z.object({
  credits: z.number().min(0),
});

type CreditsFormValues = z.infer<typeof creditsSchema>;

interface CreditsInputProps {
  agencyId: string;
  clientOrganizationId: string;
  userId: string;
  orderId: Order.Type["id"];
  creditOperationValue?: number;
  canAddCredits: boolean;
  orderTitle?: string;
}

const CreditsInput = ({
  agencyId,
  clientOrganizationId,
  userId,
  orderId,
  creditOperationValue,
  canAddCredits,
  orderTitle,
}: CreditsInputProps) => {
  const { t } = useTranslation("orders");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<CreditsFormValues>({
    resolver: zodResolver(creditsSchema),
    defaultValues: {
      credits: creditOperationValue ?? 0,
    },
  });

  const initialValueRef = useRef(creditOperationValue ?? 0);

  // Get the credit id
  const { data: credit, isLoading: isLoadingCredit } = useQuery({
    queryKey: ["credit", clientOrganizationId],
    queryFn: () => getCredit(clientOrganizationId),
    enabled: !!clientOrganizationId && !!canAddCredits,
    retry: 1,
  });

  const creditId = credit?.id ?? "";

  const { mutate: createCreditMutation, isPending } = useMutation({
    mutationFn: async (data: CreditsFormValues) => {
      const creditOperationId = crypto.randomUUID();

      if (data.credits < 0) {
        throw new Error("Credits cannot be negative");
      }
      const creditOperation = await createCredit({
        client_organization_id: clientOrganizationId,
        agency_id: agencyId,
        user_id: userId,
        balance: undefined,
        credit_operations: [
          {
            description: `<a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}">Order # ${orderId} - ${orderTitle ?? ''}</a>`,
            id: creditOperationId,
            quantity: Math.abs(data.credits),
            actor_id: userId,
            credit_id: creditId,
            type: CreditOperations.Enums.Type.USER,
            status: CreditOperations.Enums.Status.CONSUMED,
          },
        ],
      });

      return {
        creditOperationId,
        creditOperation,
      };
    },
    onError: () => {
      toast.error(t("common:error"), {
        description: t("responses:error.credits.failedToCreateCreditOperation"),
      });
      reset({ credits: initialValueRef.current }); // Reset to last known good value
    },
    onSuccess: async ({ creditOperationId }) => {
      // Add the new fk relation to the order
      await updateOrder(orderId, {
        credit_operation_id: creditOperationId,
      });
      toast.success(t("common:success"), {
        description: t("responses:success.credits.creditOperationCreated"),
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["organization-credits", clientOrganizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["organization-credit", clientOrganizationId],
      });
    },
  });

  // Handler for blur event
  const handleBlur = handleSubmit((data) => {
    if (!canAddCredits) return;
    if (data.credits === initialValueRef.current) return; // Only trigger if value changed
    createCreditMutation(data);
  });

  const isLoading = isLoadingCredit || isPending;
  return (
    <div className="flex justify-between items-center text-gray-700 py-2">
      <div className="flex items-center gap-2">
        <CreditIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{t("credits.input.label")}</span>
      </div>
      <Input
        disabled={!canAddCredits || isLoading}
        type="number"
        placeholder={t("credits.input.placeholder")}
        {...register("credits", { valueAsNumber: true })}
        onBlur={handleBlur}
        className={cn(
          "w-fit border-none text-right px-0 text-gray-700 placeholder:text-gray-700",
          "disabled:cursor-auto focus:outline-none focus:ring-0",
          `${isLoading ? "disabled:opacity-50" : "disabled:opacity-100"}`
        )}
      />

      {/* {errors.credits && (
        <span className="text-red-500 text-xs">{errors.credits.message}</span>
      )} */}
    </div>
  );
};

export default CreditsInput;
