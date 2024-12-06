import React, { forwardRef, useState, useImperativeHandle, useRef, useEffect } from 'react';
import { StickyNote, X } from 'lucide-react';
import { createFile, createUploadBucketURL } from '~/team-accounts/src/server/actions/files/create/create-file';
import { useTranslation } from 'react-i18next';
import { generateUUID } from '~/utils/generate-uuid';
import { deleteFile } from '~/team-accounts/src/server/actions/files/delete/delete-file';
import { Spinner } from '@kit/ui/spinner';
import { PDFIcon, DOCIcon, DOCXIcon, TXTIcon, CSVIcon, XLSIcon, XLSXIcon, PPTIcon, PPTXIcon, FIGIcon, AIIcon, PSDIcon, INDDIcon, AEPIcon, HTMLIcon, CSSIcon, RSSIcon, SQLIcon, JSIcon, JSONIcon, JAVAIcon, XMLIcon, EXEIcon, DMGIcon, ZIPIcon, RARIcon } from '~/orders/[id]/components/fileIcons';

interface FileUploaderProps {
  onFileSelect?: (fileIds: string[]) => void;
  onFileIdsChange?: (fileIds: string[]) => void;
  onMessageSend?: boolean;
  onFileUploadStatusUpdate?: (file: File, status: 'uploading' | 'completed' | 'error', serverId?: string) => void;
  thereAreFilesUploaded?: (value: boolean) => void;
}

interface FileWithServerId {
  file: File;
  serverId?: string;
  url?: string;
  progress?: number;
  error?: string;
}

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

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onFileSelect, onFileIdsChange, onMessageSend, onFileUploadStatusUpdate, thereAreFilesUploaded  }, ref) => {
    const { t } = useTranslation();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
    const [fileUrls, setFileUrls] = useState<File[]>([]); 
    const inputRef = useRef<HTMLInputElement>(null);
    const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
    const [globalFileList, setGlobalFileList] = useState<FileWithServerId[]>([]);
    const uuid = generateUUID();

    useImperativeHandle(ref, () => inputRef.current!);

    const sanitizeFileName = (fileName: string) => {
      return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    };

    const uploadFile = async (file: File) => {
      onFileUploadStatusUpdate?.(file, 'uploading');

      setGlobalFileList(prevList => [
        ...prevList, 
        {
          file, 
          progress: 0,
        }
      ]);

      const bucketName = 'orders';
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
      const xhr = new XMLHttpRequest();
  
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
            prevFile === file ? { ...prevFile, progress } : prevFile
          ));
          if(progress < 90){
            setGlobalFileList((prevList) => prevList.map((prevFile) =>
              prevFile.file === file ? { ...prevFile, progress } : prevFile
            ));
          }
        }
      });
  
      xhr.upload.addEventListener('error', () => {
        onFileUploadStatusUpdate?.(file, 'error');
        setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
          prevFile === file ? { ...prevFile, error: t('orders:uploadError', { fileName: file.name }) } : prevFile
        ));
      });
  
      xhr.upload.addEventListener('load', () => {
        setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
          prevFile === file ? { ...prevFile, progress: 100 } : prevFile
        ));
        setGlobalFileList((prevList) => prevList.map((prevFile) =>
          prevFile.file === file ? { ...prevFile, progress: 99 } : prevFile
        ));
      });
  
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status !== 200) {
            onFileUploadStatusUpdate?.(file, 'error');
            try {
              const response = JSON.parse(xhr.responseText);
              const errorMessage = response.message || 'Unknown error';
              setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
                prevFile === file ? { ...prevFile, error: t('orders:uploadError', { fileName: file.name }) + `: ${errorMessage}` } : prevFile
              ));
            } catch (e) {
              setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
                prevFile === file ? { ...prevFile, error: t('orders:uploadError', { fileName: file.name }) + `: ${xhr.statusText}` } : prevFile
              ));
            }
          }
        }
      };
  
      try {
        const data = await createUploadBucketURL(bucketName, filePath);
        if ('error' in data) {
          onFileUploadStatusUpdate?.(file, 'error');
          setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
            prevFile === file ? { ...prevFile, error: `Error to obtain the URL: ${data.error}` } : prevFile
          ));
          return;
        }
        xhr.open('PUT', data.signedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
        const fileUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/orders/' + filePath;
        
        const newFileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
        };

        const createdFiles = await createFile([newFileData]);
        
        if (onFileSelect) {
          const allServerIds = createdFiles.map((file) => file.id);
          onFileSelect(allServerIds);
          if (onFileIdsChange){
            onFileIdsChange(allServerIds);
          }
        }

        setFileUrls((prevFiles) => [
          ...prevFiles,
          { ...file, serverId: createdFiles[0]?.id, url: createdFiles[0]?.url }
        ]);

        onFileUploadStatusUpdate?.(file, 'completed', createdFiles[0]?.id);


        setGlobalFileList((prevList) => prevList.map((prevFile) =>
          prevFile.file === file ? { 
            ...prevFile, 
            serverId: 
            createdFiles[0]?.id, 
            url: createdFiles[0]?.url,
            progress: 100, } : prevFile
        ));

      } catch (error) {
        onFileUploadStatusUpdate?.(file, 'error');
        setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
          prevFile === file ? { ...prevFile, error: t('orders:uploadURLError', { error: error.message }) } : prevFile
        ));
      }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const newFiles = Array.from(files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setFileUrls((prevFiles) => [...prevFiles, ...newFiles]);
        
        newFiles.forEach((file) => {
          uploadFile(file).catch((error) => {
            console.error('Error uploading file', error);
          });
        });
      }
      if (thereAreFilesUploaded){
        thereAreFilesUploaded(true);
      }
    };

    const removeFile = async (fileToRemove: File) => {
      setSelectedFiles((prevFiles) => 
        prevFiles.filter((item) => item !== fileToRemove)
      );

      if (globalFileList.find((item) => item.file === fileToRemove)) {
        setGlobalFileList((prevList) =>
          prevList.filter((item) => item.file !== fileToRemove)
        );
        await deleteFile(globalFileList.find((item) => item.file === fileToRemove)?.serverId ?? '', globalFileList.find((item) => item.file === fileToRemove)?.url ?? '');
      }
    };

    const getFileTypeIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
      return fileTypeIcons[extension] ?? <StickyNote className="text-gray-500 h-[56px] w-[40px]" />;
    };

    useEffect(() => {
      if (onMessageSend) {
        setSelectedFiles([]);
        setFileUrls([]);
      }
    }, [onMessageSend]);
    
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
                  controls
                  muted 
                />
              ) : (
                <div className='w-24 h-16 flex items-center justify-center flex-col border rounded-lg bg-white'>
                  {getFileTypeIcon(file.name)} 
                </div>
              )}
              {
                globalFileList.find((item) => item.file === file)?.progress < 100 &&(
                  <div className='items-center flex justify-center absolute w-full h-full'>
                    <Spinner  className='w-5 h-5'/>
                  </div>
                )
              }
            </div>
            {
              globalFileList.find((item) => item.file === file)?.progress > 0 && globalFileList.find((item) => item.file === file)?.progress < 100 &&(
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${globalFileList.find((item) => item.file === file)?.progress}%` }}
                  />
                </div>
              )
            }
            <div>
              <p className="text-sm text-gray-600 truncate w-24">{file.name ?? 'fileName'}</p>
            </div>
            {hoveredFileId === id && globalFileList.find((item) => item.file === file)?.progress > 0 &&(
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
