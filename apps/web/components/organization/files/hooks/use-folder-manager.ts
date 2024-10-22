import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
  getClientFiles,
  getFilesByFolder,
  getFilesWithoutFolder,
  getMemberFiles,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import {
  getAllFolders,
  getFoldersByFolder,
  getOrdersFolders,
} from 'node_modules/@kit/team-accounts/src/server/actions/folders/get/get-folders';

interface FileManagementHook {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  mainFolders: Array<{ title: string | null; uuid: string }>;
  mainFiles: Array<{
    id: string | undefined;
    url: string | undefined;
    name: string | undefined;
    type: string | undefined;
  }>;
  folders: Array<{ title: string | null; uuid: string }>;
  subFolders: Array<{ title: string | null; uuid: string }>;
  files: Array<{ id: string; url: string; name: string; type: string }>;
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
}

export const useFileManagement = (
  clientOrganizationId: string,
  setCurrentPath?: React.Dispatch<
    React.SetStateAction<Array<{ title: string; uuid?: string }>>
  >,
  initialPath?: Array<{ title: string; uuid?: string }>,
): FileManagementHook => {
  const [selectedOption, setSelectedOption] = useState('all');
  const [path, setPath] = useState<Array<{ title: string; uuid?: string }>>(
    initialPath ?? [],
  );
  const [showFolders, setShowFolders] = useState(false);
  const [showSubFolders, setShowSubFolders] = useState(false);
  const [currentFolderType, setCurrentFolderType] = useState<
    'main' | 'orders' | 'sub'
  >('main');

  const initializeWithPath = (
    pathToInitialize: Array<{ title: string; uuid?: string }>,
  ) => {
    setPath(pathToInitialize);
    const lastFolder = pathToInitialize[pathToInitialize.length - 1];
    handleFolderClick(lastFolder!.uuid ?? '', lastFolder!.title, true, true);
  };

  const {
    data: mainFiles = [],
    refetch: refetchFiles,
    isLoading: loadingFiles,
  } = useQuery({
    queryKey: ['files', clientOrganizationId, selectedOption],
    queryFn: () => {
      if (selectedOption === 'client_uploaded') {
        return getClientFiles(clientOrganizationId);
      } else if (selectedOption === 'team_uploaded') {
        return getMemberFiles(clientOrganizationId);
      } else {
        return getFilesWithoutFolder(clientOrganizationId);
      }
    },
    enabled: selectedOption !== '',
  });

  // useQuery for mainFolders
  const {
    data: mainFolders = [],
    refetch: refetchFolders,
    isLoading: loadingFolders,
  } = useQuery({
    queryKey: ['folders', clientOrganizationId],
    queryFn: () => getAllFolders(clientOrganizationId),
    enabled: selectedOption === 'all',
  });

  // useQuery for folders
  const { data: folders = [], isLoading: loadingSubFolders } = useQuery({
    queryKey: ['foldersByFolder', clientOrganizationId, selectedOption],
    queryFn: () => getOrdersFolders(clientOrganizationId),
    enabled: selectedOption === 'all',
  });

  // useQuery for subFolders
  const lastFolderUuid = path.length > 0 ? path[path.length - 1]!.uuid : '';

  const { data: subFoldersData = [], isLoading: loadingNestedFolders } =
    useQuery({
      queryKey: ['subFolders', lastFolderUuid],
      queryFn: () => {
        const folderUuid = path.length > 0 ? path[path.length - 1]!.uuid : '';
        if (!folderUuid) {
          throw new Error('Folder UUID is undefined');
        }
        return getFoldersByFolder(folderUuid);
      },
      enabled: Boolean(path.length > 0) && currentFolderType !== 'orders',
    });

  const subFolders = subFoldersData.map((folder) => ({
    title: folder.name,
    uuid: folder.id,
  }));

  // useQuery for files
  const { data: filesData = [], isLoading: loadingFolderFiles } = useQuery({
    queryKey: ['files', path.length > 0 ? path[path.length - 1]!.uuid : ''],
    queryFn: () =>
      getFilesByFolder(path.length > 0 ? path[path.length - 1]!.uuid! : ''),
    enabled: Boolean(path.length > 0) && currentFolderType !== 'orders',
  });

  const files = filesData.filter(
    (file): file is { id: string; url: string; name: string; type: string } =>
      file !== null,
  );

  const handleFolderClick = (
    folderUuid: string,
    folderTitle: string,
    isOrderFolder = false,
    noUpdatePath?: boolean,
  ) => {
    if (path.length === 0) {
      // Clicking a main folder
      if (folderTitle === 'Orders' || isOrderFolder) {
        setCurrentFolderType('orders');
        setShowFolders(true);
        setShowSubFolders(false);
      } else {
        setCurrentFolderType('main');
        setShowFolders(false);
        setShowSubFolders(true);
      }
    } else {
      // Clicking a subfolder
      setCurrentFolderType('sub');
      setShowSubFolders(true);
    }

    if (!noUpdatePath) {
      updatePath(folderTitle, folderUuid);
    }
  };
  const handlePathClick = async (index: number) => {
    if (index === -1) {
      await resetState();
    } else {
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      setCurrentPath && setCurrentPath(newPath);

      // Update folder type based on level
      if (newPath.length === 0) {
        setCurrentFolderType('main');
      } else if (newPath[0]!.title === 'Orders') {
        setCurrentFolderType('orders');
      } else {
        setCurrentFolderType('sub');
      }
    }
  };

  const resetState = async () => {
    setPath([]);
    setCurrentPath && setCurrentPath([]);
    setShowFolders(false);
    setShowSubFolders(false);
    setCurrentFolderType('main');
    await refetchFiles();
    await refetchFolders();
  };

  const updatePath = (folderTitle: string, folderUuid: string) => {
    const newPathItem = { title: folderTitle, uuid: folderUuid };

    setPath((prevPath) => {
      return [...prevPath, newPathItem];
    });

    setCurrentPath &&
      setCurrentPath((prevPath) => {
        return [...prevPath, newPathItem];
      });
  };

  return {
    selectedOption,
    setSelectedOption,
    mainFolders,
    mainFiles,
    folders,
    subFolders,
    files,
    path,
    showFolders,
    showSubFolders,
    currentFolderType,
    loading:
      loadingFiles ||
      loadingFolders ||
      loadingSubFolders ||
      loadingNestedFolders ||
      loadingFolderFiles,
    handleFolderClick,
    handlePathClick,
    initializeWithPath,
  };
};
