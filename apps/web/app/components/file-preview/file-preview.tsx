"use client";
import React from "react";
import {  Download} from "lucide-react";
import { Button } from "@kit/ui/button";
import { Spinner } from "@kit/ui/spinner";
import { getFileType, canPreviewFile } from "../../lib/file-types";
import { renderers, type FileRendererProps } from "./renderers";
// import { useTranslation } from "react-i18next";
import FileUploadCard from "./file-upload-card";
import { getFileExtension } from "../shared/file-icons";

const FilePreview: React.FC<FileRendererProps> = ({
  src,
  fileName,
  fileType,
  className = "",
  isDialog = false,
  isLoading = false,
  onDownload,
  renderAs = "inline",
  upload,
  onRemove,
  enableValidation = false,
  validationTimeout = 10000,
  onFileError,
}) => {
  const type = getFileType(fileType, fileName.split(".").pop());
  const canPreview = canPreviewFile(type);
  const Component = renderers[type];
  const props = { 
    src, 
    fileName, 
    fileType, 
    className, 
    isDialog, 
    renderAs,
    upload,
    enableValidation,
    validationTimeout,
    onFileError,
  };
  // const { t } = useTranslation("files");

  if (upload &&  upload?.status === "uploading") {
    return <FileUploadCard
    fileName={upload.file.name}
    fileType={upload.file.type}
    extension={getFileExtension(upload.file.name)}
    fileSize={upload.file.size}
    upload={upload}
    loadingMethod="loading"
    className={className}
    onRemove={onRemove}
    />
  }
  return (
    <div className={`relative ${className} flex flex-col gap-2`}>

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
