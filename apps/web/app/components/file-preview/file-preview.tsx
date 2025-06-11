"use client";
import React from "react";
import { CheckCircle, Download, X } from "lucide-react";
import { Button } from "@kit/ui/button";
import { Spinner } from "@kit/ui/spinner";
import { getFileType, canPreviewFile } from "../../lib/file-types";
import { renderers, type FileRendererProps } from "./renderers";
import { formatFileSize } from "./utils/format-file-size";
import { useTranslation } from "react-i18next";

const FilePreview: React.FC<FileRendererProps> = ({
  src,
  fileName,
  fileType,
  className = "",
  isDialog = false,
  isLoading = false,
  onDownload,
  renderAs = "inline",
  uploadState,
}) => {
  const type = getFileType(fileType, fileName.split(".").pop());
  const canPreview = canPreviewFile(type);
  const Component = renderers[type];
  const props = { src, fileName, fileType, className, isDialog, renderAs };
  const { t } = useTranslation("files");

  return (
    <div className={`relative ${className} flex flex-col gap-2`}>
      {/* Progress UI */}
      {uploadState && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{`${formatFileSize(uploadState.size * (uploadState.progress / 100))} / ${formatFileSize(uploadState.size)}`}</span>
            <span
              className={`${uploadState.status === "success" ? "text-green-500" : uploadState.status === "error" ? "text-red-500" : "text-blue-500"}`}
            >{`${uploadState.progress}%`}</span>
            {uploadState.status === "success" ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-500">{t("upload.success")}</span>
              </>
            ) : uploadState.status === "error" ? (
              <>
                <X className="w-4 h-4 text-red-500" />
                <span className="text-red-500">{t("upload.error")}</span>
              </>
            ) : null}

          </div>
        </div>
      )}

      <div className={isLoading ? "blur-[0.5px]" : ""}>
        <Component {...props} />
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30">
          <Spinner className="h-6 w-6 text-gray-400" />
        </div>
      )}

      {!canPreview && isDialog && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
