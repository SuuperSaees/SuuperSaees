import { Download, StickyNote, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { File } from '../context/activity-context';
import ImageWithOptions from '../hoc/with-image-options';
import { PDFIcon, DOCIcon, DOCXIcon, TXTIcon, CSVIcon, XLSIcon, XLSXIcon, PPTIcon, PPTXIcon, FIGIcon, AIIcon, PSDIcon, INDDIcon, AEPIcon, HTMLIcon, CSSIcon, RSSIcon, SQLIcon, JSIcon, JSONIcon, JAVAIcon, XMLIcon, EXEIcon, DMGIcon, ZIPIcon, RARIcon } from './fileIcons';

interface UserFileProps {
  file: File;
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

const getFileTypeIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return fileTypeIcons[extension] ?? <StickyNote className="text-gray-500 h-[56px] w-[40px]" />;
};

const getFileExtensionFromType = (url: string): string => {
  const urlParts = url.split('/').pop()?.split('.') ?? [];
  return urlParts[urlParts.length - 1] ?? '';
};

const deleteFileExtension = (fileName: string): string => {
  const urlParts = fileName.split('/').pop()?.split('.') ?? [];
  return urlParts.slice(0, -1).join('.') ?? '';
};

const handleDownload = async ({src, fileName}: {src: string, fileName: string}) => {
  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error('Failed to fetch file');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deleteFileExtension(fileName)}.${getFileExtensionFromType(src)}`; 
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
  }
};

const UserFile = ({ file }: UserFileProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className='flex flex-col'>
          <div className='h-[150px] w-[150px] flex item-center justify-center rounded-lg'>
            <ImageWithOptions
              src={file?.url}
              alt={file.name}
              bucketName="orders"
              className="object-cover rounded-lg object-center items-center border" 
              dialogClassName="object-contain" 
            />
          </div>
          <p className="text-sm font-medium text-gray-400 truncate w-[150px]">{file.name ?? 'fileName'}</p>
        </div>
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <div className='flex flex-col'>
          <div className='h-[150px] w-[150px] flex item-center justify-center'>
            <video className="w-full max-w-[400px] rounded-lg" controls>
              <source src={file.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-sm font-medium text-gray-400 truncate w-[150px]">{file.name ?? 'fileName'}</p>
        </div>
      );
    }else{
      return (
        <div className="relative group">
          <div className="flex flex-col items-center">
            <div className="h-[150px] w-[150px] flex items-center justify-center flex-col border rounded-lg bg-white">
              {getFileTypeIcon(file.name)}
            </div>
            <p className="text-sm font-medium text-gray-400 truncate w-[150px]">{file.name ?? 'fileName'}</p>
          </div>
          {isDownloading ? (
            <div className="absolute h-[30px] w-[30px] top-2 right-2 p-2 bg-white rounded-full shadow-lg">
              <Loader2 className="h-[15px] w-[15px] animate-spin" />
            </div>
          ) : (
            <button
              className="absolute h-[30px] w-[30px] top-2 right-2 p-2 hidden group-hover:block bg-white rounded-full shadow-lg"
              onClick={async (e) => {
                e.preventDefault();
                setIsDownloading(true);
                try {
                  await handleDownload({ src: file.url, fileName: file.name });
                } finally {
                  setIsDownloading(false);
                }
              }}
            >
              <Download className="h-[15px] w-[15px]" />
            </button>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex mb-10">
      {renderFilePreview(file)}
    </div>
  );
};

export default UserFile;