'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Brief } from '~/lib/brief.types';
import { File as ServerFile } from '~/lib/file.types';
import { fetchFormfieldsWithResponses } from '~/team-accounts/src/server/actions/briefs/get/get-brief';

import { useActivityContext } from '../context/activity-context';
import PreviewPDF from './file-types/preview-pdf';
import PreviewVideo from './file-types/preview-video';
import { SkeletonBox } from '~/components/ui/skeleton';
import ImageWithOptions from '../hoc/with-image-options';

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
    return <ImageWithOptions src={url} alt={name} bucketName="orders" />;
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

  const briefsWithResponsesQuery = useQuery({
    queryKey: ['briefsWithResponses', order.brief_ids],
    queryFn: async () =>
      await fetchFormfieldsWithResponses(order.brief_ids ?? []),
  });

  const briefsWithResponses = briefsWithResponsesQuery.data ?? [];


  const Field = ({
    formField,
  }: {
    formField: Brief.Relationships.FormFieldResponse.Response;
  }) => {
    const formatResponse = (
      formField: Brief.Relationships.FormFieldResponse.Response,
    ) => {
      if (formField.field?.type === 'date') {
        // Improve formate to be more readable with dateFns
        return format(formField.response, 'PPPP');
      }
      if (formField.field?.type === 'rich-text') {
        return formField.response;
      } else {
        return convertLinks(formField.response);
      }
    };
    return (
      <div className="flex w-full flex-col gap-2 rounded-lg px-3 py-2">
        <span className="overflow-hidden text-ellipsis font-bold leading-6 text-gray-700">
          {formField.field?.label}
        </span>
        <span
          className="font-medium leading-[1.42857] text-gray-600"
          dangerouslySetInnerHTML={{ __html: formatResponse(formField) }}
        ></span>
      </div>
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
      {briefsWithResponsesQuery.isLoading ? (
        Array.from({ length: 5 }, (_, i) => 
          <SkeletonBox className='h-20 w-full' key={i} />
        )
      ) : (
        <div className="flex flex-col gap-8">
          {/* <div className="mb-[6px] flex">
          <span className="font-inter text-sm font-medium leading-5 text-gray-700">
            <Trans i18nKey="orders:OrderDescriptionTitle" />{' '}
          </span>
        </div>
        <div
          className="rounded-lg border border-gray-300 px-[14px] py-[12px]"
          dangerouslySetInnerHTML={{ __html: convertLinks(order.description) }}
        /> */}
          {briefsWithResponses.map((formField) => {
            if (formField.field?.type !== 'file') {
              return <Field key={formField.field?.id} formField={formField} />;
            }
            return null;
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-8 pb-8">
        {order?.files?.map((file) => (
          <div
            key={file.id}
            className="flex h-[209px] w-[220px] flex-col items-start gap-2 rounded-md border border-gray-200 bg-white p-[10px] px-[14px]"
          >
            <div className="h-[137px] w-[192px] overflow-y-auto overflow-x-hidden flex items-center justify-center">
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
