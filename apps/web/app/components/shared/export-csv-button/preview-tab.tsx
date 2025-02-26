'use client';

import React from 'react';

import { InfoCircledIcon, TableIcon } from '@radix-ui/react-icons';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';

import { ExportableData, PreviewTabProps } from './types';

/**
 * Preview tab component for the export CSV dialog
 */
const PreviewTab = <T extends ExportableData>({
  t,
  selectedColumns,
  columnHeaders,
  getPreviewData,
  formatPreviewValue,
}: PreviewTabProps<T>) => {
  return (
    <div className="py-4 w-full">
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
          <TableIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {t('export.previewTitle')}
            </h3>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
              {t('export.previewDescription')}
            </p>
          </div>
        </div>

        {selectedColumns.length > 0 ? (
          <div className="border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800">
            <div className="overflow-x-auto w-full max-w-full max-h-[300px]">
              <TooltipProvider>
                <Table className='overflow-x-auto w-full max-w-full'>
                  <TableHeader className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                    <TableRow>
                      {selectedColumns.map((column) => (
                        <TableHead 
                          key={column}
                          className="font-medium whitespace-nowrap text-gray-700 dark:text-gray-300"
                          style={{ minWidth: '120px' }}
                        >
                          {columnHeaders[column] ?? column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPreviewData().map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {selectedColumns.map((column) => {
                          const value = formatPreviewValue(
                            (item as Record<string, unknown>)[column],
                            column
                          );
                          return (
                            <TableCell
                              key={`${index}-${column}`}
                              className="max-w-[200px] border-b border-gray-100 dark:border-gray-700"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate hover:text-blue-600 dark:hover:text-blue-400">
                                    {value || <span className="text-gray-400 italic text-xs">Empty</span>}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-gray-800 text-white dark:bg-gray-700">
                                  <p className="max-w-xs break-words">{value || 'Empty value'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center bg-gray-50 dark:bg-gray-800 flex flex-col items-center gap-2">
            <InfoCircledIcon className="h-8 w-8 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('export.noColumnsSelected')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewTab; 