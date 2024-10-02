import { useEffect, useState } from 'react';



import { useQuery } from '@tanstack/react-query';
import { getClientFiles, getFilesByFolder, getFilesWithoutFolder, getMemberFiles } from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import {
  getAllFolders,
  getFoldersByFolder,
  getOrdersFolders,
} from 'node_modules/@kit/team-accounts/src/server/actions/folders/get/get-folders';

interface FileManagementHook {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  mainFolders: Array<{ title: string | null; uuid: string }>;
  mainFiles: Array<{ id: string; url: string; name: string; type: string }>;
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
  ) => Promise<void>;
  handlePathClick: (index: number) => Promise<void>;
  initializeWithPath: (
    path: Array<{ title: string; uuid?: string }>,
  ) => Promise<void>;
}

export const useFileManagement = (
  clientOrganizationId: string,
  setCurrentPath?: React.Dispatch<
    React.SetStateAction<Array<{ title: string; uuid?: string }>>
  >,
  initialPath?: Array<{ title: string; uuid?: string }>,
): FileManagementHook => {
  const [selectedOption, setSelectedOption] = useState('all');
  const [mainFolders, setMainFolders] = useState<
    Array<{ title: string | null; uuid: string }>
  >([]);
  // const [mainFiles, setMainFiles] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
  const [folders, setFolders] = useState<
    Array<{ title: string | null; uuid: string }>
  >([]);
  const [subFolders, setSubFolders] = useState<
    Array<{ title: string | null; uuid: string }>
  >([]);
  const [files, setFiles] = useState<
    Array<{ id: string; url: string; name: string; type: string }>
  >([]);
  const [path, setPath] = useState<Array<{ title: string; uuid?: string }>>([]);
  const [showFolders, setShowFolders] = useState(false);
  const [showSubFolders, setShowSubFolders] = useState(false);
  const [loading, setLoading] = useState(false);

  const initializeWithPath = async (
    pathToInitialize: Array<{ title: string; uuid?: string }>,
  ) => {
    setPath(pathToInitialize);
    const lastFolder = pathToInitialize[pathToInitialize.length - 1];
    await handleFolderClick(
      lastFolder!.uuid ?? '',
      lastFolder!.title,
      true,
      true,
    );
  };
  const { data: mainFiles = [], refetch: refetchFiles } = useQuery({
    queryKey: ['files', clientOrganizationId],
    enabled: selectedOption === 'all',
    queryFn: () => getFilesWithoutFolder(clientOrganizationId),
  });

  useEffect(() => {
    if (initialPath && initialPath.length > 0) {
      initializeWithPath(initialPath).catch((error) =>
        console.error('Error initializing with path:', error),
      );
    } else {
      const fetchRootLevel = async () => {
        setLoading(true);
        setCurrentPath && setCurrentPath([]);
        try {
          let fetchedFiles;
          if (selectedOption === 'all') {
            const fetchedFolders = await getAllFolders(clientOrganizationId);
            setMainFolders(fetchedFolders);
            fetchedFiles = await getFilesWithoutFolder(clientOrganizationId);
          } else if (selectedOption === 'team_uploaded') {
            setLoading(true);
            resetState();
            fetchedFiles = await getMemberFiles(clientOrganizationId);
          } else if (selectedOption === 'client_uploaded') {
            setLoading(true);
            resetState();
            fetchedFiles = await getClientFiles(clientOrganizationId);
          }
          // setMainFiles(fetchedFiles ?? []);
        } catch (error) {
          console.error('Error fetching files:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchRootLevel().catch((error) =>
        console.error('Error fetching root level:', error),
      );
    }
  }, [clientOrganizationId, initialPath, selectedOption]);

  const handleFolderClick = async (
    folderUuid: string,
    folderTitle: string,
    isOrderFolder = false,
    noUpdatePath?: boolean,
  ) => {
    setLoading(true);
    setFiles([]);
    setFolders([]);
    try {
      if (folderUuid === '' && isOrderFolder) {
        path.length > 1 && path.pop();
        resetState();
        updatePath(folderTitle, folderUuid, true);
        const fetchedOrderFolders =
          await getOrdersFolders(clientOrganizationId);
        setFolders(fetchedOrderFolders);
        setShowFolders(true);
      } else if (folderUuid) {
        // setMainFiles([]);
        setMainFolders([]);
        setShowFolders(true);
        setShowSubFolders(false);
        if (!noUpdatePath) {
          updatePath(folderTitle, folderUuid, isOrderFolder);
        }
        const [fetchedFiles, fetchedSubFolders] = await Promise.all([
          getFilesByFolder(folderUuid),
          getFoldersByFolder(folderUuid),
        ]);
        setFiles(fetchedFiles);
        setSubFolders(
          fetchedSubFolders.map((folder) => ({
            title: folder.name,
            uuid: folder.id,
          })),
        );
        setShowSubFolders(fetchedSubFolders.length > 0);
      } else {
        resetState();
        const fetchedFolders = await getAllFolders(clientOrganizationId);
        setFolders(fetchedFolders);
        setShowFolders(true);
      }
    } catch (error) {
      console.error('Error fetching files or folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePathClick = async (index: number) => {
    if (index === -1) {
      setCurrentPath && setCurrentPath([]);
      setPath([]);
      resetState();
      const fetchedFolders = await getAllFolders(clientOrganizationId);
      setMainFolders(fetchedFolders);
    } else {
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      setCurrentPath && setCurrentPath(newPath);

      const folderUuid = newPath[newPath.length - 1]?.uuid;

      if (folderUuid) {
        setLoading(true);
        try {
          const fetchedFiles = await getFilesByFolder(folderUuid);
          setFiles(fetchedFiles);

          const fetchedSubFolders = await getFoldersByFolder(folderUuid);
          setShowSubFolders(fetchedSubFolders.length > 0);
          setSubFolders(
            fetchedSubFolders.map((folder) => ({
              title: folder.name,
              uuid: folder.id,
            })),
          );
        } catch (error) {
          console.error('Error fetching files or folders:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          setFiles([]);
          // setMainFiles([]);
          const fetchedFolders = await getOrdersFolders(clientOrganizationId);
          setFolders(fetchedFolders);
        } catch (error) {
          console.error('Error fetching folders:', error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const resetState = () => {
    setPath([]);
    setCurrentPath && setCurrentPath([]);
    setShowFolders(false);
    setShowSubFolders(false);
    setFolders([]);
    setFiles([]);
    // setMainFiles([]);
    setMainFolders([]);
    setSubFolders([]);
  };

  const updatePath = (
    folderTitle: string,
    folderUuid: string,
    isOrderFolder: boolean,
  ) => {
    const newPathItem = { title: folderTitle, uuid: folderUuid };

    setPath((prevPath) => {
      if (isOrderFolder) {
        return [...prevPath, newPathItem];
      } else {
        return [newPathItem];
      }
    });

    setCurrentPath &&
      setCurrentPath((prevPath) => {
        if (isOrderFolder) {
          return [...prevPath, newPathItem];
        } else {
          return [newPathItem];
        }
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
    loading,
    handleFolderClick,
    handlePathClick,
    initializeWithPath,
  };
};