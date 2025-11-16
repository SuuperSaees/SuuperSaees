import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { StickyNote, X } from 'lucide-react';
import { Spinner } from '@kit/ui/spinner';
import { useFileUpload } from '~/team-accounts/src/server/actions/files/upload/file-chat-uploads';
import { PDFIcon, DOCIcon, DOCXIcon, TXTIcon, CSVIcon, XLSIcon, XLSXIcon, PPTIcon, PPTXIcon, FIGIcon, AIIcon, PSDIcon, INDDIcon, AEPIcon, HTMLIcon, CSSIcon, RSSIcon, SQLIcon, JSIcon, JSONIcon, JAVAIcon, XMLIcon, EXEIcon, DMGIcon, ZIPIcon, RARIcon, MPEGIcon, MKVIcon, AVIIcon, MP3Icon, MP4Icon, CLIPIcon, WAVIcon } from '~/(main)/orders/[id]/components/file-icons';
import Image from 'next/image';

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
  mp3: <MP3Icon />,
  mp4: <MP4Icon />,
  wav: <WAVIcon />,
  avi: <AVIIcon />,
  mkv: <MKVIcon />,
  mpeg: <MPEGIcon />,
};

interface FileUploaderProps {
  onFileSelect?: (fileIds: string[]) => void;
  onFileIdsChange?: (fileIds: string[]) => void;
  onMessageSend?: boolean;
  onFileUploadStatusUpdate?: (file: File, status: 'uploading' | 'completed' | 'error', serverId?: string) => void;
  thereAreFilesUploaded?: (value: boolean) => void;
  agencyId: string;
  clientOrganizationId: string;
  folderId: string;
  referenceId?: string;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onFileSelect, onFileIdsChange, onMessageSend = false, onFileUploadStatusUpdate, thereAreFilesUploaded, agencyId, clientOrganizationId, folderId, referenceId }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
    const videoRefs = useRef<{ [key: number]: HTMLVideoElement }>({});

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
      thereAreFilesUploaded,
      agencyId,
      clientOrganizationId,
      folderId,
      referenceId
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

    useEffect(() => {
      return () => {
        Object.values(videoRefs.current).forEach(video => {
          if (video.src) {
            URL.revokeObjectURL(video.src);
          }
        });
      };
    }, []);

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
              {
                <>
                  {file.type.startsWith('image/') ? (
                    <div className="relative w-full h-full">
                      {globalFileList.find((item) => item.file === file)?.progress === 100 ? (
                        <Image 
                          src={globalFileList.find((item) => item.file === file)?.url ?? URL.createObjectURL(file)}
                          alt={file.name}
                          className="object-cover w-full h-full"
                          width={100}
                          height={100}
                          quality={60}
                          priority
                        />
                      ) : (
                        <div className='relative w-24 h-16 flex items-center justify-center flex-col border rounded-lg bg-white'>
                          <CLIPIcon />
                          <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-300/50'>
                            <Spinner className='w-5 h-5 text-black'/>
                            <p className='text-black text-sm'>{globalFileList.find((item) => item.file === file)?.progress}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : file.type.startsWith('video/') ? (
                    <div className="relative w-full h-full">
                      {globalFileList.find((item) => item.file === file)?.progress === 100 ? (
                        <video
                          ref={el => {
                            if (el) {
                              videoRefs.current[id] = el;
                              if (!el.src) {
                                el.src = URL.createObjectURL(file);
                              }
                            }
                          }}
                          className="object-cover w-full h-full"
                          muted
                          controls={false}
                          preload="metadata"
                          disablePictureInPicture
                          disableRemotePlayback
                          controlsList="nodownload noplaybackrate"
                          onLoadedMetadata={(e) => {
                            e.currentTarget.currentTime = 0;
                          }}
                          style={{ pointerEvents: 'none' }}
                        />
                      ) : (
                        <div className='relative w-24 h-16 flex items-center justify-center flex-col border rounded-lg bg-white'>
                          {getFileTypeIcon(file.name)}
                          <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-300/50'>
                            <Spinner className='w-5 h-5 text-black'/>
                            <p className='text-black text-sm'>{globalFileList.find((item) => item.file === file)?.progress}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='relative w-24 h-16 flex items-center justify-center flex-col border rounded-lg bg-white'>
                      {getFileTypeIcon(file.name)}
                      {globalFileList.find((item) => item.file === file)?.progress < 100 && (
                        <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-300/50'>
                          <Spinner className='w-5 h-5 text-black'/>
                          <p className='text-black text-sm'>{globalFileList.find((item) => item.file === file)?.progress}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              }
            </div>
            <div>
              <p className="text-sm text-gray-600 truncate w-24">{file.name}</p>
            </div>
            {hoveredFileId === id && globalFileList.find((item) => item.file === file)?.progress > 0 && (
              <div className="absolute top-[-8px] right-[-8px]">
                <X
                  className="cursor-pointer w-4 h-4 bg-white rounded-full shadow"
                  onClick={() => removeFile(file)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';
export default FileUploader;
