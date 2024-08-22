'use client';

import React from 'react';
import { useActivityContext } from '../context/activity-context';
import { CircleHelp } from 'lucide-react';
import PreviewImage  from './file-types/preview-image';
import PreviewPDF  from './file-types/preview-pdf';
import PreviewVideo  from './file-types/preview-video';

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  const getFilePreviewComponent = (file) => {
    const { type, url, name } = file;
    
    if (type.startsWith('image/')) {
      return <PreviewImage url={url} alt={name} />;
    }
    if (type.startsWith('video/')) {
      return <PreviewVideo url={url} />;
    }
    if (type === 'application/pdf') {
      return <PreviewPDF url={url} />;
    }
    return <div className='w-[192px] h-[137px] bg-gray-200 rounded-lg flex items-center justify-center'>No preview</div>;
  };

const DetailsPage = () => {
  const { order } = useActivityContext();

  return (
    <div>
      <div className='flex flex-col'>
        <div className='flex mb-[6px]'>
            <span className='text-gray-700 font-inter text-sm font-medium leading-5'>Descripción del pedido </span>
            <CircleHelp className='text-gray-500 w-4 h-4 ml-1' />
        </div>
        <textarea className='border border-gray-300 px-[14px] py-[12px] rounded-lg mb-16'>{order.description}</textarea>
        
        <div className='flex mb-[6px]'>
            <span className='text-gray-700 font-inter text-sm font-medium leading-5'>Archivos</span>
            <CircleHelp className='text-gray-500 w-4 h-4 ml-1' />
        </div>

        <div className='grid grid-cols-3 gap-4'>
          {order.files!.map((file) => (
            <div key={file.id} className='flex flex-col items-start w-[220px] p-[10px] px-[14px] gap-[8px] border border-gray-200 rounded-none rounded-tr-md rounded-bl-md rounded-br-md bg-white'>
            {getFilePreviewComponent(file)}
            <span className='text-gray-700 text-sm font-medium leading-5 overflow-hidden text-ellipsis whitespace-nowrap w-full'>{file.name}</span>
            <span className='text-gray-600 text-sm font-normal leading-5'>{formatFileSize(file.size)}</span>
          </div>
          ))}
        </div>

      </div>
    </div>
  );
};
export default DetailsPage;
