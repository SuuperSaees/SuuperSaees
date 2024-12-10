import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { StickyNote, X } from 'lucide-react';
import { Spinner } from '@kit/ui/spinner';
import { useFileUpload } from '~/team-accounts/src/server/actions/files/upload/file-chat-uploads';
import { PDFIcon, DOCIcon, DOCXIcon, TXTIcon, CSVIcon, XLSIcon, XLSXIcon, PPTIcon, PPTXIcon, FIGIcon, AIIcon, PSDIcon, INDDIcon, AEPIcon, HTMLIcon, CSSIcon, RSSIcon, SQLIcon, JSIcon, JSONIcon, JAVAIcon, XMLIcon, EXEIcon, DMGIcon, ZIPIcon, RARIcon } from '~/orders/[id]/components/fileIcons';

const fileTypeIcons: Record<string, JSX.Element> = {
  pdf: <PDFIcon />,
  doc: <DOCIcon />,
  docx: <DOCXIcon />,
  txt: <TXTIcon />,
  csv: <CSVIcon />,
  xls: <XLSIcon />,
  xlsx: <XLSXIcon />,
  ppt: <PPTIcon />,
  pptx: <PPTXIcon />,
  fig: <FIGIcon />,
  ai: <AIIcon />,
  psd: <PSDIcon />,
  indd: <INDDIcon />,
  aep: <AEPIcon />,
  html: <HTMLIcon />,
  css: <CSSIcon />,
  rss: <RSSIcon />,
  sql: <SQLIcon />,
  js: <JSIcon />,
  json: <JSONIcon />,
  java: <JAVAIcon />,
  xml: <XMLIcon />,
  exe: <EXEIcon />,
  dmg: <DMGIcon />,
  zip: <ZIPIcon />,
  rar: <RARIcon />,
};

interface FileUploaderProps {
  onFileSelect?: (fileIds: string[]) => void;
  onFileIdsChange?: (fileIds: string[]) => void;
  onMessageSend?: boolean;
  onFileUploadStatusUpdate?: (file: File, status: 'uploading' | 'completed' | 'error', serverId?: string) => void;
  thereAreFilesUploaded?: (value: boolean) => void;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onFileSelect, onFileIdsChange, onMessageSend = false, onFileUploadStatusUpdate, thereAreFilesUploaded }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);

    const {
      selectedFiles,
      globalFileList,
      handleFileChange,
      removeFile,
      resetFiles
    } = useFileUpload({
      onFileSelect,
      onFileIdsChange,
      onFileUploadStatusUpdate,
      thereAreFilesUploaded
    });

    useImperativeHandle(ref, () => inputRef.current!);

    const getFileTypeIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
      return fileTypeIcons[extension] ?? <StickyNote className="text-gray-500 h-[56px] w-[40px]" />;
    };

    useEffect(() => {
      if (onMessageSend) {
        resetFiles();
      }
    }, [onMessageSend, resetFiles]);

    return (
      <div className="overflow-y-auto overflow-x-hidden flex flex-wrap gap-2 max-h-[240px] w-full">
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
            className="relative flex flex-col items-center justify-start w-24 mt-4 m-2"
            onMouseEnter={() => setHoveredFileId(id)}
            onMouseLeave={() => setHoveredFileId(null)}
          >
            <div className="flex items-center justify-center w-24 h-16 bg-gray-200 rounded-lg overflow-hidden">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="object-cover w-full h-full"
                />
              ) : file.type.startsWith('video/') ? (
                <video
                  src={URL.createObjectURL(file)}
                  className="object-cover w-full h-full"
                  muted 
                />
              ) : (
                <div className='w-24 h-16 flex items-center justify-center flex-col border rounded-lg bg-white'>
                  {getFileTypeIcon(file.name)} 
                </div>
              )}
              {
                (globalFileList?.find((item) => item.file === file)?.progress ?? 100) < 100 && (
                    <div className='items-center flex justify-center absolute w-full h-full'>
                      <Spinner className='w-5 h-5'/>
                    </div>
                )
              }
            </div>
            {
            // Progress bar section
            ((globalFileList?.find((item) => item.file === file)?.progress ?? 0) > 0) && 
            ((globalFileList?.find((item) => item.file === file)?.progress ?? 100) < 100) && (
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${globalFileList?.find((item) => item.file === file)?.progress ?? 0}%` }}
                />
                </div>
            )
            }
            <div>
              <p className="text-sm text-gray-600 truncate w-24">{file.name}</p>
            </div>
            {
            // X button section
            hoveredFileId === id && 
            ((globalFileList?.find((item) => item.file === file)?.progress ?? 0) > 0) && (
                <div className="absolute top-[-8px] right-[-8px]">
                <X
                    className="cursor-pointer w-4 h-4 bg-white rounded-full shadow"
                    onClick={() => removeFile(file)}
                />
                </div>
            )
            }
          </div>
        ))}
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';
export default FileUploader;