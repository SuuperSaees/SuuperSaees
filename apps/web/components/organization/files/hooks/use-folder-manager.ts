import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
  // getClientFiles,
  // getFilesWithoutFolder,
  getFoldersAndFiles, // getMemberFiles,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import { Folder } from 'lucide-react';

export type FolderItem = {
  title: string;
  id: string;
  icon?: React.ComponentType<{ className?: string }>;
};
interface FileManagementHook {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  currentFolders: Array<{ title: string | null; uuid: string }>;
  currentFiles: Array<{ id: string; url: string; name: string; type: string }>;
  folderItems: Array<FolderItem>;
  showFolders: boolean;
  showSubFolders: boolean;
  loading: boolean;
  handleFolderClick: (folderUuid: string, folderTitle: string) => void;
  handlePathClick: (index: number) => Promise<void>;
  currentFolderType: 'mainfolder' | 'subfolder';
  queryKey: string[];
  currentFolderId: string;
}

export function useFileManagement(
  clientOrganizationId: string,
  agencyId: string,
  setCurrentPath?: React.Dispatch<React.SetStateAction<Array<FolderItem>>>,
  initialItems?: Array<FolderItem>,
): FileManagementHook {
  const [selectedOption, setSelectedOption] = useState('all');
  const [folderItems, setFolderItems] = useState<Array<FolderItem>>(
    initialItems?.map((i) => ({ ...i, icon: Folder })) ?? [],
  );
  const [showFolders, setShowFolders] = useState(false);
  const [showSubFolders, setShowSubFolders] = useState(false);
  // Determine initial folder type based on path
  const lastFolderItem = folderItems[folderItems.length - 1];

  const initialFolderType =
    folderItems.length === 1 || folderItems.length === 0
      ? 'mainfolder'
      : 'subfolder';

  const [currentFolderType, setCurrentFolderType] = useState<
    'mainfolder' | 'subfolder'
  >(initialFolderType);

  // Determine the correct folder ID based on current state
  const folderId = lastFolderItem?.id ?? '';

  // Fetch data using React Query
  const queryKey = ['filesAndFolders', folderId, currentFolderType];
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
        currentFolderType,
      ),
    enabled: Boolean(currentFolderType && folderId),
  });

  const folders = data?.folders ?? [];
  const files = data?.files ?? [];
  const parentFolderId = data?.parent_folder_id ?? '';
  const currentFolderId = folders?.[0]?.parent_folder_id ?? lastFolderItem?.id ?? '';
  // Handler functions

  const handleFolderClick = (folderUuid: string, folderTitle: string) => {
    if (folderItems.length === 0) {
      setCurrentFolderType('mainfolder');
      setShowFolders(true);
      setShowSubFolders(false);
    } else {
      setCurrentFolderType('subfolder');
      setShowSubFolders(true);
    }
    // Add the new folder to the path
    const newPathItem = { title: folderTitle, id: folderUuid, icon: Folder };
    setFolderItems((prev) => [...prev, newPathItem]);
    setCurrentPath?.((prev) => [...prev, newPathItem]);
  };

  const handlePathClick = async (index: number) => {
    if (index === -1) {
      setFolderItems([]);
      setCurrentPath?.([]);
      setShowFolders(false);
      setShowSubFolders(false);
      setCurrentFolderType('mainfolder');
      await refetch();
      return;
    }

    // Check and update the uuid of the previous path item relative to the current path item
    // with the parentFolderId of the current path item
    const currentPathIndex = folderItems.findIndex(
      (item) => item.id === folderId,
    );
    const previousPathItem = folderItems[currentPathIndex - 1];
    let newPath = [...folderItems];
    if (parentFolderId && previousPathItem) {
      newPath[currentPathIndex - 1] = {
        ...previousPathItem,
        id: parentFolderId,
      };
    }
    newPath = newPath.slice(0, index + 1);

    setFolderItems(newPath);
    setCurrentPath?.(newPath);

    // Check if the clicked path item is the root folder
    if (newPath.length === 1) {
      setCurrentFolderType('mainfolder');
    } else {
      setCurrentFolderType('subfolder');
    }
  };


  return {
    selectedOption,
    setSelectedOption,
    currentFolders: folders,
    currentFiles: files,
    folderItems,
    showFolders,
    showSubFolders,
    loading,
    handleFolderClick,
    handlePathClick,
    currentFolderType,
    queryKey,
    currentFolderId
  };
}
