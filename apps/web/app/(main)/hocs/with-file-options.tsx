"use client";

import React, { ComponentType, useRef } from "react";

import dynamic from "next/dynamic";

import { Check, Copy, Download, Eye, MoreVertical } from "lucide-react";

import Tooltip from "~/components/ui/tooltip";
import { File } from "~/lib/file.types";
import { FileUploadState } from "~/hooks/use-file-upload";

import { useFileActions } from "../../hooks/use-file-actions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../../../packages/ui/src/shadcn/dropdown-menu";
import { useTranslation } from "react-i18next";

const AnnotationsDialog = dynamic(
  () => import("~/(annotations)/components/dialog"),
  {
    ssr: false,
  },
);

const FileDialogView = dynamic(
  () => import("../../components/file-preview/file-dialog-view"),
  {
    ssr: false,
  },
);

export enum FileViewerMode {
  DEFAULT = "default",
  ANNOTATIONS = "annotations",
}
interface FileProps {
  file: File.Type;
  src: string;
  files: File.Type[];
  className?: string;
  dialogClassName?: string;
  bucketName?: string;
  isDialog?: boolean;
  isLoading?: boolean;
  viewerMode?: FileViewerMode;
  upload?: FileUploadState;
}

export const withFileOptions = <P extends FileProps>(
  WrappedComponent: ComponentType<
    Omit<P, "viewerMode" | "isLoading" | "upload"> & {
      fileName: string;
      fileType: string;
      isLoading?: boolean;
      upload?: FileUploadState;
    }
  >,
) => {
  const WithFileOptions: React.FC<P> = (props) => {
    const {
      viewerMode = FileViewerMode.DEFAULT,
      isLoading,
      upload,
      ...rest
    } = props;
    const previewTriggerRef = useRef<HTMLButtonElement>(null);

    // Don't show file options when loading or uploading
    const shouldShowOptions = !isLoading && upload?.status !== "uploading";

    const handleCardClick = (event: React.MouseEvent) => {
      // Don't trigger if clicking on action buttons or if loading/uploading
      if (!shouldShowOptions) return;

      // Check if the click target is an action button or its children
      const target = event.target as HTMLElement;
      if (target.closest(".file-action-button")) {
        return;
      }

      // Programmatically trigger the preview dialog
      previewTriggerRef.current?.click();
    };

    const { handleDownload } = useFileActions({
      src: props.src,
      fileName: props.file.name,
      fileType: props.file.type,
      bucketName: props.bucketName,
    });

    return (
      <>
        <div
          className="group/file-options relative inline-block flex h-fit min-w-[150px] items-center justify-center cursor-pointer hover:bg-gray-50 hover:shadow-sm transition-all duration-200 rounded-lg"
          onClick={handleCardClick}
        >
          <WrappedComponent
            {...rest}
            fileName={props.file.name}
            fileType={props.file.type}
            isLoading={isLoading}
            upload={upload}
          />
          {shouldShowOptions && (
            <FileOptions
              file={props.file}
              viewerMode={viewerMode}
              files={props.files}
              src={props.src}
              bucketName={props.bucketName}
              isLoading={isLoading}
              upload={upload}
              previewTriggerRef={previewTriggerRef}
            />
          )}
        </div>

        {/* Hidden Preview Dialogs - Triggered programmatically */}
        {viewerMode === FileViewerMode.ANNOTATIONS ? (
          <AnnotationsDialog
            file={props.file}
            triggerComponent={
              <button
                ref={previewTriggerRef}
                style={{ display: "none" }}
                aria-hidden="true"
              />
            }
            fileName={props.file.name}
            files={props.files}
          />
        ) : (
          <FileDialogView
            triggerComponent={
              <button
                ref={previewTriggerRef}
                style={{ display: "none" }}
                aria-hidden="true"
              />
            }
            fileName={props.file.name}
            fileType={props.file.type}
            src={props.src}
            onDownload={handleDownload}
          />
        )}
      </>
    );
  };

  return WithFileOptions;
};

type FileOptionsProps = Omit<FileProps, "dialogClassName" | "className"> & {
  previewTriggerRef: React.RefObject<HTMLButtonElement>;
};

const FileOptions = ({
  file,
  src,
  bucketName,
  previewTriggerRef,
}: FileOptionsProps) => {
  const { isLinkCopied, handleCopyLink, handleDownload } = useFileActions({
    src,
    fileName: file.name,
    fileType: file.type,
    bucketName,
  });

  const { t } = useTranslation("files");
  return (
    <>
      {/* Mobile: Dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="md:hidden file-action-button p-2 text-black absolute right-1 top-1 rounded-full bg-white/70">
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => handleCopyLink().catch(console.error)}
          >
            {isLinkCopied ? (
              <Check className="h-[15px] w-[15px] text-green-500 mr-2" />
            ) : (
              <Copy className="h-[15px] w-[15px] mr-2" />
            )}
            {t("fileOptions.copyLink")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => previewTriggerRef.current?.click()}>
            <Eye className="h-[15px] w-[15px] mr-2" />
            {t("fileOptions.view")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDownload().catch(console.error)}
          >
            <Download className="h-[15px] w-[15px] mr-2" />
            {t("fileOptions.download")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop: Horizontal menu */}
      <div
        className={
          "hidden absolute right-0 top-8 z-10 flex-col items-start gap-2 rounded-md bg-transparent p-2 text-gray-700 md:right-0 md:top-0 md:flex-row md:items-center md:group-hover/file-options:flex"
        }
      >
        <FileOption
          icon={
            isLinkCopied ? (
              <Check className="h-[15px] w-[15px] text-green-500" />
            ) : (
              <Copy className="h-[15px] w-[15px]" />
            )
          }
          label={t("fileOptions.copyLink")}
          onClick={() => handleCopyLink().catch(console.error)}
        />
        <FileOption
          icon={<Eye className="h-[15px] w-[15px]" />}
          label={t("fileOptions.view")}
          onClick={() => previewTriggerRef.current?.click()}
        />
        <FileOption
          icon={<Download className="h-[15px] w-[15px]" />}
          label={t("fileOptions.download")}
          onClick={() => handleDownload().catch(console.error)}
        />
      </div>
    </>
  );
};

interface FileOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}
const FileOption = ({ icon, label, onClick }: FileOptionProps) => {
  return (
    <Tooltip content={label}>
      <button
        className="file-action-button flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
        onClick={onClick}
      >
        {icon}
      </button>
    </Tooltip>
  );
};
export default withFileOptions;
