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
// import { useMutation } from "@tanstack/react-query";

export const editCreditsSchema = z.object({
  quantity: z.number().min(1),
  description: z.string().optional(),
});

interface EditCreditsFormProps {
  initialData?: CreditOperations.Response;
  mode: "edit" | "create";
}

const EditCreditsForm = ({
  initialData,
  mode = "create",
}: EditCreditsFormProps) => {
  const { t } = useTranslation(["credits"]);

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

  // const { mutate: creditsMutation, isPending: isCreatingCredits } = useMutation({
  //   mutationFn: (data: z.infer<typeof editCreditsSchema>) => {
  //     return createCred
  //   },
  // });
  const form = useForm<z.infer<typeof editCreditsSchema>>({
    resolver: zodResolver(editCreditsSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof editCreditsSchema>) => {
    console.log(data);
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
                  {...field}
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

        <ThemedButton type="submit" className="w-full mt-auto">
          <Trans i18nKey={`credits:form.${mode}.actions.submit`} />
        </ThemedButton>
      </form>
    </Form>
  );
};

export default EditCreditsForm;
