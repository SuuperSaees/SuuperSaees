"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { CreditOperations } from "~/lib/credit.types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kit/ui/form";
import { Input } from "@kit/ui/input";
import { Trans, useTranslation } from "react-i18next";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCredit } from "~/server/actions/credits/credits.action";
import { Spinner } from "@kit/ui/spinner";
import { toast } from "sonner";

export const editCreditsSchema = z.object({
  quantity: z.number().min(1),
  description: z.string().optional(),
});

interface EditCreditsFormProps {
  mode: "edit" | "create";
  creditId: string;
  clientOrganizationId: string;
  agencyId: string;
  userId: string;
  initialData?: CreditOperations.Response;
}

const EditCreditOperationsForm = ({
  initialData,
  mode = "create",
  creditId,
  clientOrganizationId,
  agencyId,
  userId,
}: EditCreditsFormProps) => {
  const { t } = useTranslation(["credits", "responses", "common"]);
  const queryClient = useQueryClient();

  const defaultValues =
    mode === "create"
      ? {
          quantity: 0,
          description: "",
        }
      : {
          quantity: initialData?.quantity ?? 0,
          description: initialData?.description ?? "",
        };

  const { mutate: creditsMutation, isPending: isCreatingCredits } = useMutation(
    {
      mutationFn: (data: z.infer<typeof editCreditsSchema>) => {
        return createCredit({
          client_organization_id: clientOrganizationId,
          agency_id: agencyId,
          user_id: userId,
          balance: undefined,
          credit_operations: [
            {
              quantity: data.quantity,
              description: data.description,
              actor_id: userId,
              credit_id: creditId,
              type: CreditOperations.Enums.Type.USER,
              status: CreditOperations.Enums.Status.PURCHASED,
            },
          ],
        });
      },
      onError: () => {
        toast.error(t("common:error"), {
          description: t("responses:error.credits.failedToCreateCreditOperation"),
        });
      },
      onSuccess: () => {
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
        form.reset();
      },
    },
  );

  const form = useForm<z.infer<typeof editCreditsSchema>>({
    resolver: zodResolver(editCreditsSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof editCreditsSchema>) => {
    creditsMutation(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full h-full"
      >
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={`credits:form.${mode}.inputs.quantity.label`} />
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t(
                    `credits:form.${mode}.inputs.quantity.placeholder`,
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans
                  i18nKey={`credits:form.${mode}.inputs.description.label`}
                />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t(
                    `credits:form.${mode}.inputs.description.placeholder`,
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ThemedButton
          type="submit"
          className="flex items-center gap-2 w-full mt-auto"
          disabled={isCreatingCredits}
        >
          {isCreatingCredits && <Spinner className="w-4 h-4" />}
          <Trans i18nKey={`credits:form.${mode}.actions.submit`} />
        </ThemedButton>
      </form>
    </Form>
  );
};

export default EditCreditOperationsForm;
