import React, { useEffect, useRef, useState } from 'react';
import { CloudUpload, StickyNote, X, XIcon } from 'lucide-react';
import { Progress } from '../../../../packages/ui/src/shadcn/progress';
import { useTranslation } from 'react-i18next';
import { useFileUpload } from '~/team-accounts/src/server/actions/files/upload/file-uploads';
import { PDFIcon, DOCIcon, DOCXIcon, TXTIcon, CSVIcon, XLSIcon, XLSXIcon, PPTIcon, PPTXIcon, FIGIcon, AIIcon, PSDIcon, INDDIcon, AEPIcon, HTMLIcon, CSSIcon, RSSIcon, SQLIcon, JSIcon, JSONIcon, JAVAIcon, XMLIcon, EXEIcon, DMGIcon, ZIPIcon, RARIcon } from '~/orders/[id]/components/file-icons';

interface FileInfo {
  file: File;
  serverId?: string;
  progress: number;
  error?: string;
}

interface UploadFileComponentProps {
  bucketName: string;
  uuid: string;
  onFileIdsChange: (fileIds: string[], fileUrls?: string[]) => void;
  removeResults?: boolean;
  toggleExternalUpload?: () => void;
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

export default function UploadFileComponent({
  bucketName,
  uuid,
  onFileIdsChange,
  removeResults = false,
  toggleExternalUpload,
}: UploadFileComponentProps) {
  const { t } = useTranslation();
  const { files, setFiles, uploadFile, handleDelete, generateFileId } = useFileUpload(bucketName, uuid, onFileIdsChange, removeResults);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMessage, setDragMessage] = useState(t('dragAndDrop'));
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);

  const inputId = `file-input-${uuid}`;

  const handleFileInputClick = () => {
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      setFiles((prevFiles) => ({ ...prevFiles, '': { file: null, progress: 0, error: t('selectFile') } }));
      return;
    }
    const newFiles = selectedFiles.reduce((acc, file) => {
      const id = generateFileId();
      acc[id] = { file, progress: 0 };
      return acc;
    }, {} as Record<string, FileInfo>);
    setFiles((prevFiles) => ({ ...prevFiles, ...newFiles }));
    for (const [id, fileInfo] of Object.entries(newFiles)) {
      await uploadFile(id, fileInfo.file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) {
      setFiles((prevFiles) => ({ ...prevFiles, '': { file: null, progress: 0, error: t('selectFile') } }));
      return;
    }
    const newFiles = droppedFiles.reduce((acc, file) => {
      const id = generateFileId();
      acc[id] = { file, progress: 0 };
      return acc;
    }, {} as Record<string, FileInfo>);
    setFiles((prevFiles) => ({ ...prevFiles, ...newFiles }));
    for (const [id, fileInfo] of Object.entries(newFiles)) {
      await uploadFile(id, fileInfo.file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    setDragMessage(t('orders:dropHere'));
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setDragMessage(t('orders:dragAndDrop'));
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
    return fileTypeIcons[extension] ?? <StickyNote className="text-gray-500" />;
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [files]);

  return (
    <div className="flex flex-col gap-2">
      <button onClick={toggleExternalUpload} className="self-end">
        <XIcon className="h-4 w-4" />
      </button>
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 ${isDragging ? 'bg-gray-300' : 'bg-gray-100'} `}
        onClick={handleFileInputClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mb-[12px] flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-gray-200 p-2">
          <CloudUpload className="h-[20px] w-[20px] text-gray-600" />
        </div>
        <p className="text-sm text-gray-600">{dragMessage}</p>
        <input
          type="file"
          id={inputId}
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </div>
      <div className="overflow-y-auto overflow-x-hidden flex flex-wrap gap-1 max-h-[240px] w-full">
        {Object.entries(files).map(([id, fileInfo]) => (
          <div
            key={id}
            className="relative flex flex-col items-center justify-start w-24 mt-4 m-2"
            onMouseEnter={() => setHoveredFileId(id)}
            onMouseLeave={() => setHoveredFileId(null)}
          >
            <div className="flex items-center justify-center w-24 h-16 bg-gray-200 rounded-lg overflow-hidden">
              {fileInfo.file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(fileInfo.file)}
                  alt={fileInfo.file.name}
                  className="object-cover w-full h-full"
                />
              ) : fileInfo.file.type.startsWith('video/') ? (
                <video
                  src={URL.createObjectURL(fileInfo.file)}
                  className="object-cover w-full h-full"
                  muted 
                />
              ) : (
                <div className='w-24 h-16 flex items-center justify-center flex-col border rounded-lg bg-white'>
                  {getFileTypeIcon(fileInfo.file.name ?? 'fileName')} 
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 truncate w-24">{fileInfo.file.name ?? 'fileName'}</p>
              <p className="text-xs text-gray-400">{formatFileSize(fileInfo.file.size)}</p>
              {fileInfo.error && <p className="text-xs text-red-500">{fileInfo.error}</p>}
              {fileInfo.progress > 0 && (
                <Progress value={fileInfo.progress ?? 0} className="w-full" />
              )}
            </div>
            {hoveredFileId === id && (
              <div className="absolute top-[-8px] right-[-8px]">
                <X
                  className="cursor-pointer w-4 h-4 bg-white rounded-full shadow"
                  onClick={() => handleDelete(id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}