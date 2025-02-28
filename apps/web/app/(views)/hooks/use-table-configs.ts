'use client';

import useStorageConfigs from '~/hooks/use-storage-configs';

interface TableViewConfig extends Record<string, unknown> {
  rowsPerPage: number;
  // Add more configuration options as needed
}

/**
 * Hook for managing table view configurations
 * @param tableId - Unique identifier for the table (used as part of the storage key)
 * @returns Configuration and methods to update it
 */
export function useTableConfigs(storageKey = 'table-config') {
  const defaultConfig: TableViewConfig = {
    rowsPerPage: 10,
  };

  const { configs, updateConfig, updateConfigs, resetConfigs } =
    useStorageConfigs<TableViewConfig>(storageKey, defaultConfig);

  const config = {
    rowsPerPage: {
      value: configs.rowsPerPage,
      onUpdate: (value: string) => updateConfig('rowsPerPage', Number(value)),
    },
  };
  return {
    configs,
    updateConfig,
    updateConfigs,
    resetConfigs,
    config,
  };
}

export default useTableConfigs;
