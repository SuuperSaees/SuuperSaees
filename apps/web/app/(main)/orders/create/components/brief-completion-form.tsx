"use client";

import { UseMutationResult } from "@tanstack/react-query";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { ThemedInput } from "node_modules/@kit/accounts/src/components/ui/input-themed-with-settings";
import { ThemedTextarea } from "node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings";
import { useTranslation } from "react-i18next";

import { Button } from "@kit/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@kit/ui/form";
import { useMultiStepFormContext } from "@kit/ui/multi-step-form";
import { Spinner } from "@kit/ui/spinner";

import { Brief } from "~/lib/brief.types";
import { File } from "~/lib/file.types";

import FilesUploader from "../../../../components/file-preview/files-uploader";
import BriefCard from "./brief-card";
import ClientAssignation from "./client-assignation";
import { OrderBriefs } from "./order-briefs";
import { FileUploadState } from "~/hooks/use-file-upload";

interface BriefCompletionFormProps {
  brief: Brief.Relationships.Services.Response | null;
  orderMutation: UseMutationResult<
    void,
    Error,
    {
      values: {
        briefSelection: {
          selectedBriefId: string;
        };
        briefCompletion: {
          uuid: string;
          files: File.Insert[];
          brief_responses: Record<string, string | undefined | Date>;
          description?: string | undefined;
          title?: string | undefined;
          order_followers?: string[] | undefined;
        };
      };
    },
    unknown
  >;
  uniqueId: string;
  userRole: string;
  clientOrganizationId?: string | null;
  agencyId?: string | null;
  setClientOrganizationId: (clientOrganizationId: string) => void;
}

export default function BriefCompletionForm({
  brief,
  uniqueId,
  orderMutation,
  userRole,
  clientOrganizationId,
  agencyId,
  setClientOrganizationId,
}: BriefCompletionFormProps) {
  const { t } = useTranslation("orders");
  const { form, prevStep } = useMultiStepFormContext();

  const handleFilesChange = (uploads: FileUploadState[]) => {
    const filesToInsert: File.Insert[] = uploads.map((upload) => ({
      id: upload.id ?? undefined,
      name: upload.file.name ?? "",
      size: upload.file.size ?? 0,
      type: upload.file.type ?? "",
      url: upload.url ?? "",
      user_id: "",
    }));
    form.setValue("briefCompletion.files", filesToInsert);
    const responseValue = filesToInsert.map((file) => file.url).join(",");
    form.setValue("briefCompletion.files", responseValue as never);
  };

  const handleRemoveFile = (id: string) => {
    const currentFiles =
      (form.getValues("briefCompletion.files") as File.Insert[]) || [];
    const updatedFiles = currentFiles.filter((file) => file.id !== id);
    form.setValue("briefCompletion.files", updatedFiles);
    const responseValue = updatedFiles.map((file) => file.url).join(",");
    form.setValue("briefCompletion.files", responseValue as never);
  };

  return (
    <Form {...form}>
      <div className="flex h-full max-h-full w-full flex-col justify-between gap-8">
        <div className="max-w-7xl flex h-full flex-wrap gap-16 lg:flex-nowrap mx-auto w-full overflow-y-auto">
          <div className="flex w-full max-w-full shrink-0 flex-col items-start justify-between gap-16 lg:sticky lg:top-0 lg:h-fit lg:max-w-xs">
            <BriefCard brief={brief} className="lg:w-full max-w-xs"/>
            {(userRole === "agency_owner" ||
              userRole === "agency_project_manager" ||
              userRole === "agency_member") && (
              <ClientAssignation
                onSelectOrganization={setClientOrganizationId}
                className="lg:w-xs w-full"
              />
            )}
          </div>

          <div className="flex h-full max-h-full w-full flex-col justify-between gap-8">
            {!brief && (
              <>
                <FormField
                  name="briefCompletion.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThemedInput
                          {...field}
                          placeholder={t("creation.form.titlePlaceholder")}
                          className="focus-visible:ring-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="briefCompletion.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThemedTextarea
                          {...field}
                          placeholder={t(
                            "creation.form.descriptionPlaceholder",
                          )}
                          rows={5}
                          className="focus-visible:ring-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {clientOrganizationId && agencyId && (
                  <FilesUploader
                    bucketName="orders"
                    path={`/uploads/${uniqueId}`}
                    // bucketName="orders"
                    // uuid={uniqueId}
                    // onFileIdsChange={handleFileIdsChange}
                    onFilesSelected={handleFilesChange}
                    onRemoveFile={handleRemoveFile}
                  />
                )}
              </>
            )}
            {clientOrganizationId && agencyId && (
              <OrderBriefs
                brief={brief}
                form={form}
                orderId={form.getValues("briefCompletion.uuid")}
              />
            )}
          </div>
        </div>

        <div className="flex w-full justify-between py-4">
          <Button variant={"outline"} type="button" onClick={prevStep}>
            {t("pagination.previous")}
          </Button>

          <ThemedButton type="submit" className="flex gap-2">
            <span>{t("creation.form.submitMessage")}</span>
            {orderMutation.isPending && (
              <Spinner className="h-4 w-4 text-white" />
            )}
          </ThemedButton>
        </div>
      </div>
    </Form>
  );
}
