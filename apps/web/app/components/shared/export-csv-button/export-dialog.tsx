'use client';

import React, { useState } from 'react';

import { DownloadIcon, GearIcon, TableIcon } from '@radix-ui/react-icons';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { ExportableData, ExportDialogProps } from './types';
import PreviewTab from './preview-tab';
import SettingsTab from './settings-tab';

/**
 * Export dialog component for the CSV export
 */
const ExportDialog = <T extends ExportableData>({
  isOpen,
  onClose,
  onExport,
  data,
  t,
  availableColumns,
  columnHeaders,
  selectedColumns,
  setSelectedColumns,
  filename,
  setFilename,
  delimiter,
  setDelimiter,
  usePagination,
  setUsePagination,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  formatPreviewValue,
}: ExportDialogProps<T>) => {
  const [activeTab, setActiveTab] = useState('settings');

  // Handle column selection
  const handleColumnToggle = (column: string) => {
    setSelectedColumns(
      selectedColumns.includes(column)
        ? selectedColumns.filter((col) => col !== column)
        : [...selectedColumns, column]
    );
  };

  // Handle select all columns
  const handleSelectAllColumns = () => {
    setSelectedColumns(availableColumns);
  };

  // Handle clear all columns
  const handleClearAllColumns = () => {
    setSelectedColumns([]);
  };

  // Get preview data (first 5 rows)
  const getPreviewData = () => {
    // Apply pagination if needed
    let dataToPreview = data;
    if (usePagination) {
      const startIndex = (currentPage - 1) * pageSize;
      dataToPreview = data.slice(startIndex, startIndex + pageSize);
    }

    // Limit to 5 rows for preview
    return dataToPreview.slice(0, 5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-full max-w-full min-w-0 h-5/6 flex flex-col gap-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 overflow-hidden p-8">
        <DialogHeader className="pb-2 border-b sticky top-0 z-20 bg-inherit">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="bg-emerald-100 dark:bg-emerald-900 p-1.5 rounded-md">
              <DownloadIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            {t('export.exportOptions')}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {t('export.configureAndPreview')}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-full min-w-0 flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2 sticky top-0 z-10">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <GearIcon className="h-4 w-4" />
              {t('export.settings')}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              {t('export.preview')}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="settings" className="mt-0 h-full">
              <SettingsTab
                t={t}
                filename={filename}
                setFilename={setFilename}
                delimiter={delimiter}
                setDelimiter={setDelimiter}
                usePagination={usePagination}
                setUsePagination={setUsePagination}
                pageSize={pageSize}
                setPageSize={setPageSize}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                availableColumns={availableColumns}
                columnHeaders={columnHeaders}
                selectedColumns={selectedColumns}
                handleColumnToggle={handleColumnToggle}
                handleSelectAllColumns={handleSelectAllColumns}
                handleClearAllColumns={handleClearAllColumns}
                dataLength={data.length}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0 h-full">
              <PreviewTab
                t={t}
                selectedColumns={selectedColumns}
                columnHeaders={columnHeaders}
                getPreviewData={getPreviewData}
                formatPreviewValue={formatPreviewValue}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-auto pt-4 border-t sticky bottom-0 z-20 bg-inherit">
          <Button variant="outline" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">
            {t('cancel')}
          </Button>
          <ThemedButton onClick={onExport} className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            {t('export.export')}
          </ThemedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog; 