import { Download, StickyNote } from 'lucide-react';

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

const handleDownload = async ({src, type}) => {
  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error('Failed to fetch image');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `download.${type}`; 
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
  }
};

const UserFile = ({ file }: UserFileProps) => {
  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className='flex flex-col'>
          <div className='h-[150px] w-[150px] flex item-center justify-center border rounded-lg'>
            <ImageWithOptions
              src={file?.url}
              alt="image"
              bucketName="orders"
              className="object-cover rounded-lg" 
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
          <button
            className="absolute h-[30px] w-[30px] top-2 right-2 p-2 hidden group-hover:block bg-white rounded-full shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              handleDownload({ src: file.url, type: file.type }).catch(console.error);
            }}
          >
            <Download className="h-[15px] w-[15px]" />
          </button>
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