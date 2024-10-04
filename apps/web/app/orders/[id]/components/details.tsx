'use client';

import React from 'react';



import { Trans } from '@kit/ui/trans';



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
  const { order } = useActivityContext();

  const convertLinks = (text: string) => {
    const urlRegex =
      /\b(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))/gi;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`,
    );
  };

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
            <Trans i18nKey="orders:OrderDescriptionTitle" />{' '}
          </span>
        </div>
        <div
          className="rounded-lg border border-gray-300 px-[14px] py-[12px]"
          dangerouslySetInnerHTML={{ __html: convertLinks(order.description) }}
        />
      </div>

      <div className="flex flex-wrap gap-8 pb-8">
        {order?.files?.map((file) => (
          <div
            key={file.id}
            className="flex h-[209px] w-[220px] flex-col items-start gap-2 rounded-md border border-gray-200 bg-white p-[10px] px-[14px]"
          >
            <div className="h-[137px] w-[192px] overflow-y-auto">
              {getFilePreviewComponent(file)}
            </div>
            <span className="line-clamp-1 w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-700">
              {file.name}
            </span>
            <span className="text-sm font-normal text-gray-600">
              {formatFileSize(file.size)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


export default DetailsPage;