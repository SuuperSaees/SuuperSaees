'use client';

import { useMemo, useRef } from 'react';
import { Download, SlidersVertical } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { CustomDropdownMenu } from '../../../components/ui/dropdown-menu';
import ExportCSVButton, { ExportCSVButtonRef } from '../../../components/shared/export-csv-button/index';
import { ExportableData, PaginationConfig } from '../../../components/shared/export-csv-button/types';

interface SettingsDropdownProps<T extends ExportableData> {
  data: T[];
  t: (key: string) => string;
  allowedColumns: string[];
  defaultSelectedColumns: string[];
  columnHeaders: Record<string, string>;
  valueFormatters: Record<string, (value: unknown) => string>;
  disabled?: boolean;
  defaultFilename?: string;
  pagination?: PaginationConfig;
}

function SettingsDropdown<T extends ExportableData>({
  data,
  t,
  allowedColumns,
  defaultSelectedColumns,
  columnHeaders,
  valueFormatters,
  disabled = false,
  defaultFilename = 'export.csv',
  pagination,
}: SettingsDropdownProps<T>) {
  const exportButtonRef = useRef<ExportCSVButtonRef>(null);

  // Settings dropdown menu items
  const settingsDropdownItems = useMemo(() => [
    {
      id: 'export-csv',
      type: 'item' as const,
      label: t('export.exportCSV'),
      icon: Download,
      onClick: () => {
        // Directly call the openDialog method on the ExportCSVButton
        if (exportButtonRef.current) {
          exportButtonRef.current.openDialog();
        }
      }
    }
    // Additional settings options can be added here in the future
  ], [t]);

  return (
    <>
      <div className="hidden">
        <ExportCSVButton
          ref={exportButtonRef}
          disabled={disabled}
          data={data}
          t={t}
          allowedColumns={allowedColumns}
          defaultFilename={defaultFilename}
          defaultSelectedColumns={defaultSelectedColumns}
          columnHeaders={columnHeaders}
          valueFormatters={valueFormatters}
          pagination={pagination}
        />
      </div>
      <CustomDropdownMenu
        className='text-gray-600'
        trigger={
          <Button variant="outline" className="flex items-center justify-center w-10 h-10 p-0">
            <SlidersVertical className="h-4 w-4" />
          </Button>
        }
        items={settingsDropdownItems}
        
      />
    </>
  );
}

export default SettingsDropdown; 