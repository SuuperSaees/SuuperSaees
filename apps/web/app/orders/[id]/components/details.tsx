'use client';

import React from 'react';



import { CircleHelp } from 'lucide-react';

import { File as ServerFile } from '~/lib/file.types';

import { useActivityContext } from '../context/activity-context';
import PreviewImage from './file-types/preview-image';
import PreviewPDF from './file-types/preview-pdf';
import PreviewVideo from './file-types/preview-video';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};

const getFilePreviewComponent = (file: ServerFile.Type) => {
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
  return (
    <div className="flex h-[137px] w-[192px] items-center justify-center rounded-lg bg-gray-200">
      No preview
    </div>
  );
};

const DetailsPage = () => {
  const { order, files } = useActivityContext();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full min-w-full gap-2">
        <div className="w-full rounded-lg border border-gray-300 px-[12px] py-[8px]">
          <span className="font-inter text-md overflow-hidden text-ellipsis leading-6 text-gray-500">
            {order.title}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="mb-[6px] flex">
          <span className="font-inter text-sm font-medium leading-5 text-gray-700">
            Descripción del pedido{' '}
          </span>
          <CircleHelp className="ml-1 h-4 w-4 text-gray-500" />
        </div>
        <textarea
          className="rounded-lg border border-gray-300 px-[14px] py-[12px]"
          rows={10}
          disabled={true}
        >
          {order.description}
        </textarea>
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

        <div className="grid grid-cols-3 gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex h-56 w-full flex-col items-start gap-2 rounded-none rounded-bl-md rounded-br-md rounded-tr-md border border-gray-200 bg-white p-[10px] px-[14px]"
            >
              {getFilePreviewComponent(file)}
              <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium leading-5 text-gray-700">
                {file.name}
              </span>
              <span className="text-sm font-normal leading-5 text-gray-600">
                {formatFileSize(file.size)}
              </span>
            </div>
          ))}
        </div>
      </div>
  );
};
export default DetailsPage;