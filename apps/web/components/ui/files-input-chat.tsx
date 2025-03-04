import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';

import { X } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';


import { useFileUpload } from '~/team-accounts/src/server/actions/files/upload/file-chat-uploads';

import FileUploadCard from '../../app/components/file-preview/file-upload-card';



interface FileUploaderProps {
  onFileSelect?: (fileIds: string[]) => void;
  onFileIdsChange?: (fileIds: string[]) => void;
  onMessageSend?: boolean;
  onFileUploadStatusUpdate?: (
    file: File,
    status: 'uploading' | 'completed' | 'error',
    serverId?: string,
  ) => void;
  thereAreFilesUploaded?: (value: boolean) => void;
  referenceId?: string;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  (
    {
      onFileSelect,
      onFileIdsChange,
      onMessageSend = false,
      onFileUploadStatusUpdate,
      thereAreFilesUploaded,
      referenceId,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
    const videoRefs = useRef<{ [key: number]: HTMLVideoElement }>({});

    const {
      selectedFiles,
      globalFileList,
      handleFileChange,
      removeFile,
      resetFiles,
    } = useFileUpload({
      onFileSelect,
      onFileIdsChange,
      onFileUploadStatusUpdate,
      thereAreFilesUploaded,
      referenceId,
    });

    useImperativeHandle(ref, () => inputRef.current!);



    useEffect(() => {
      if (onMessageSend) {
        resetFiles();
      }
    }, [onMessageSend, resetFiles]);

    useEffect(() => {
      return () => {
        Object.values(videoRefs.current).forEach((video) => {
          if (video.src) {
            URL.revokeObjectURL(video.src);
          }
        });
      };
    }, []);

    return (
      <div className="flex max-h-[240px] w-full flex-wrap gap-2 overflow-y-auto overflow-x-hidden">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {selectedFiles.map((file, id) => (
          <div
            key={id}
            className="group relative m-2 mt-4 flex flex-col items-center justify-start"
            onMouseEnter={() => setHoveredFileId(id)}
            onMouseLeave={() => setHoveredFileId(null)}
          >
            <div className="flex items-center justify-center rounded-lg">
              {
                <>
                  {file.type.startsWith('image/') ? (
                    <div className="relative group/image h-full w-full">
                      <Image
                        src={
                          globalFileList.find((item) => item.file === file)
                            ?.url ?? URL.createObjectURL(file)
                        }
                        alt={file.name}
                        className="h-20 w-20 rounded-lg object-cover"
                        width={100}
                        height={100}
                        quality={60}
                        priority
                      />
                      {globalFileList?.find((item) => item.file === file)
                        ?.progress < 100 && (
                        <button
                          className="absolute -right-2 -top-2 z-[100] rounded-full border border-2 border-white bg-gray-800/100 p-0.5 hover:bg-gray-800/70"
                        >
                          <Spinner className="h-3 w-3 text-white" />
                        </button>
                      )}
                      {removeFile && (
                        <button
                          onClick={() => removeFile(file)}
                          className="absolute -right-2 -top-2 z-[200] rounded-full border border-2 border-white bg-gray-800/100 p-0.5 hover:bg-gray-800/70 group-hover/image:block hidden"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <FileUploadCard
                      fileName={file?.name ?? ''}
                      fileType={file?.type ?? ''}
                      extension={
                        file?.name?.split('.').pop()?.toLowerCase() ?? ''
                      }
                      isLoading={
                        globalFileList?.find((item) => item.file === file)
                          ?.progress < 100
                      }
                      onRemove={() => removeFile(file)}
                    />
                  )}
                </>
              }
            </div>

            {/* {hoveredFileId === id && globalFileList.find((item) => item.file === file)?.progress > 0 && (
              <div className="absolute top-[-8px] right-[-8px]">
                <X
                  className="cursor-pointer w-4 h-4 bg-white rounded-full shadow"
                  onClick={() => removeFile(file)}
                />
              </div>
            )} */}
          </div>
        ))}
      </div>
    );
  },
);

FileUploader.displayName = 'FileUploader';
export default FileUploader;
