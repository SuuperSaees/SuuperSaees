import { forwardRef } from 'react';

import { File } from '~/lib/file.types';
import { FilePreview } from '~/(main)/orders/[id]/components/files/file-preview';

interface AnnotationsThumbnailsSidebarProps {
  files: File.Type[];
  selectedFile: File.Type | null;
  setSelectedFile: (file: File.Type) => void;
  setCurrentFileType: (fileType: string) => void;
  resetZoom: () => void;
  setCurrentPage: (page: number) => void;
}
const AnnotationsThumbnailsSidebar = forwardRef<HTMLDivElement, AnnotationsThumbnailsSidebarProps>(({
  files,
  selectedFile,
  setSelectedFile,
  setCurrentFileType,
  resetZoom,
  setCurrentPage,
}: AnnotationsThumbnailsSidebarProps, ref) => {

  return (
    <div
      ref={ref}
      className="flex w-52 h-full flex-col items-center gap-4 overflow-y-auto py-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2"
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
                  ? 'border-2 border-blue-500'
                  : 'bg-gray-100'
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
              {file.name ?? 'fileName'}
            </p>
          </div>
        ))}
    </div>
  );
});

AnnotationsThumbnailsSidebar.displayName = 'AnnotationsThumbnailsSidebar';

export default AnnotationsThumbnailsSidebar;
