import { useLayoutEffect, useRef } from "react";

import { FilePreview } from "~/(main)/orders/[id]/components/files/file-preview";
import { AnnotationsThumbnailsSidebarProps } from "../types/types";
import { cn } from "@kit/ui/utils";

const AnnotationsThumbnailsSidebar = ({
  files,
  selectedFile,
  setSelectedFile,
  setCurrentFileType,
  resetZoom,
  setCurrentPage,
  className,
}: AnnotationsThumbnailsSidebarProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (selectedFile && ref && "current" in ref && ref.current) {
      const container = ref.current;
      const selectedElement = container.querySelector(
        `[data-file-id="${selectedFile.id}"]`,
      );

      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selectedFile, ref]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex px-6 w-fit shrink-0 h-full flex-col items-center gap-4 overflow-y-auto py-4 min-h-0",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 ",
        "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2",
        className,
      )}
    >
      {files
        ?.filter(
          (file, index, self) =>
            index === self.findIndex((f) => f.id === file.id),
        )
        .map((file, index) => (
          <div
            data-file-id={file.id}
            className="flex cursor-pointer flex-col hover:opacity-80"
            key={index}
            onClick={() => {
              setSelectedFile(file);
              setCurrentFileType(file.type);
              resetZoom();
              setCurrentPage(1);
            }}
          >
            <div
              className={`item-center flex h-[150px] w-[150px] justify-center rounded-lg border ${
                selectedFile?.id === file.id
                  ? "border-2 border-blue-500"
                  : "bg-gray-100 border-transparent"
              }`}
            >
              <FilePreview
                src={file.url}
                fileName={file.name}
                fileType={file.type}
                className="max-h-full max-w-full"
              />
            </div>
            <p className="w-[150px] truncate text-sm font-medium text-gray-400">
              {file.name ?? "fileName"}
            </p>
          </div>
        ))}
    </div>
  );
};

export default AnnotationsThumbnailsSidebar;
