'use client';

import { useMemo } from 'react';
import { Download, SlidersVertical } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { CustomDropdownMenu } from '../../../components/ui/dropdown-menu';
import ExportCSVButton from '../../../components/shared/export-csv-button/index';
import { ExportableData } from '../../../components/shared/export-csv-button/types';

interface SettingsDropdownProps<T extends ExportableData> {
  data: T[];
  t: (key: string) => string;
  allowedColumns: string[];
  defaultSelectedColumns: string[];
  columnHeaders: Record<string, string>;
  valueFormatters: Record<string, (value: unknown) => string>;
  disabled?: boolean;
  defaultFilename?: string;
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
}: SettingsDropdownProps<T>) {
  // Create a hidden ExportCSVButton that will be triggered by the dropdown
  const hiddenExportButton = (
    <div className="hidden">
      <ExportCSVButton
        disabled={disabled}
        data={data}
        t={t}
        allowedColumns={allowedColumns}
        defaultFilename={defaultFilename}
        defaultSelectedColumns={defaultSelectedColumns}
        columnHeaders={columnHeaders}
        valueFormatters={valueFormatters}
      />
    </div>
  );

  // Settings dropdown menu items
  const settingsDropdownItems = useMemo(() => [
    {
      id: 'export-csv',
      type: 'item' as const,
      label: t('export.exportCSV'),
      icon: Download,
      onClick: () => {
        // Find the button inside the hidden ExportCSVButton and click it
        const button = document.querySelector('.hidden .flex.items-center.gap-2') as HTMLButtonElement;
        if (button) {
          button.click();
        }
      }
    }
    // Additional settings options can be added here in the future
  ], [t]);

  return (
    <>
      {hiddenExportButton}
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