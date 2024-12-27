import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
  // getClientFiles,
  // getFilesWithoutFolder,
  getFoldersAndFiles, // getMemberFiles,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import { useTranslation } from 'react-i18next';

interface FileManagementHook {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  currentFolders: Array<{ title: string | null; uuid: string }>;
  currentFiles: Array<{ id: string; url: string; name: string; type: string }>;
  path: Array<{ title: string; uuid?: string }>;
  showFolders: boolean;
  showSubFolders: boolean;
  loading: boolean;
  handleFolderClick: (
    folderUuid: string,
    folderTitle: string,
    isOrderFolder?: boolean,
  ) => void;
  handlePathClick: (index: number) => Promise<void>;
  initializeWithPath: (path: Array<{ title: string; uuid?: string }>) => void;
  currentFolderType: 'main' | 'orders' | 'sub';
  queryKey: string[];
}

export function useFileManagement(
  clientOrganizationId: string,
  agencyId: string,
  setCurrentPath?: React.Dispatch<
    React.SetStateAction<Array<{ title: string; uuid?: string }>>
  >,
  initialPath?: Array<{ title: string; uuid?: string }>,
): FileManagementHook {
  const { t } = useTranslation('organizations');
  const [selectedOption, setSelectedOption] = useState('all');
  const [path, setPath] = useState<Array<{ title: string; uuid?: string }>>(
    initialPath ?? [],
  );
  const [showFolders, setShowFolders] = useState(false);
  const [showSubFolders, setShowSubFolders] = useState(false);

  // Determine initial folder type based on path
  const lastPath = path[path.length - 1];
  const initialFolderType = !lastPath
    ? 'main'
    : lastPath.title === t('organizations:files.orders')
      ? 'orders'
      : 'sub';
  const [currentFolderType, setCurrentFolderType] = useState<
    'main' | 'orders' | 'sub'
  >(initialFolderType);

  // Determine query parameters based on current state
  const type =
    currentFolderType === 'main' || currentFolderType === 'orders'
      ? 'mainfolder'
      : 'subfolder';
  const target =
    selectedOption === 'client_uploaded'
      ? 'client'
      : selectedOption === 'team_uploaded'
        ? 'team'
        : currentFolderType === 'orders' ||
            (path[0]?.title === t('organizations:files.orders') &&
              currentFolderType === 'sub')
          ? 'project'
          : 'all';

  // Determine the correct folder ID based on current state
  const folderId =
    (target === 'all' && type === 'mainfolder') ||
    (target === 'project' && type === 'mainfolder')
      ? clientOrganizationId
      : (lastPath?.uuid ?? clientOrganizationId);

  // Fetch data using React Query
  const queryKey = ['filesAndFolders', folderId, target, type];
  const {
    data,
    refetch,
    isLoading: loading,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      getFoldersAndFiles(
        folderId,
        clientOrganizationId,
        agencyId,
        target,
        type,
      ),
    enabled: Boolean(target && type && folderId),
  });

  const folders = data?.folders ?? [];
  const files = data?.files ?? [];

  // Handler functions

  const handleFolderClick = (
    folderUuid: string,
    folderTitle: string,
    isOrderFolder = false,
    noUpdatePath?: boolean,
  ) => {
    if (path.length === 0) {
      if (folderTitle === t('organizations:files.orders') || isOrderFolder) {
        setCurrentFolderType('orders');
        setShowFolders(true);
        setShowSubFolders(false);
      } else {
        setCurrentFolderType('sub');
        setShowFolders(false);
        setShowSubFolders(true);
      }
    } else {
      setCurrentFolderType('sub');
      setShowSubFolders(true);
    }

    if (!noUpdatePath) {
      const newPathItem = { title: folderTitle, uuid: folderUuid };
      setPath((prev) => [...prev, newPathItem]);
      setCurrentPath?.((prev) => [...prev, newPathItem]);
    }
  };

  const handlePathClick = async (index: number) => {
    if (index === -1) {
      setPath([]);
      setCurrentPath?.([]);
      setShowFolders(false);
      setShowSubFolders(false);
      setCurrentFolderType('main');
      await refetch();
      return;
    }

    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setCurrentPath?.(newPath);

    if (newPath.length === 0) {
      setCurrentFolderType('main');
    } else if (newPath[0]?.title === t('organizations:files.orders')) {
      setCurrentFolderType('orders');
    } else {
      setCurrentFolderType('sub');
    }
  };

  const initializeWithPath = (
    pathToInitialize: Array<{ title: string; uuid?: string }>,
  ) => {
    setPath(pathToInitialize);
    const lastFolder = pathToInitialize[pathToInitialize.length - 1];
    if (lastFolder) {
      handleFolderClick(lastFolder.uuid ?? '', lastFolder.title, true, true);
    }
  };

  return {
    selectedOption,
    setSelectedOption,
    currentFolders: folders,
    currentFiles: files,
    path,
    showFolders,
    showSubFolders,
    loading,
    handleFolderClick,
    handlePathClick,
    initializeWithPath,
    currentFolderType,
    queryKey,
  };
}
