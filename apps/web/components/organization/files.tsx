'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilesByFolder, getFilesWithoutFolder, getMemberFiles, getClientFiles } from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import { getAllFolders, getOrdersFolders, getFoldersByFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/get/get-folders';
import FolderItem from './files/folder-item';
import FileItem from './files/file-item';
import RadioOptions from './files/radio-options';
interface FileSectionProps {
  clientOrganizationId: string;
  setCurrentPath: React.Dispatch<React.SetStateAction<Array<{ title: string; uuid?: string }>>>;
}

const FileSection: React.FC<FileSectionProps> = ({ clientOrganizationId, setCurrentPath }) => {
  const { t } = useTranslation('organizations');
  const [selectedOption, setSelectedOption] = useState('all');
  const [mainFolders, setMainFolders] = useState<Array<{ title: string | null; uuid: string }>>([]);
  const [mainFiles, setMainFiles] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
  const [folders, setFolders] = useState<Array<{ title: string | null; uuid: string }>>([]);
  const [subFolders, setSubFolders] = useState<Array<{ title: string | null; uuid: string }>>([]);
  const [files, setFiles] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
  const [path, setPath] = useState<Array<{ title: string; uuid?: string }>>([]);
  const [showFolders, setShowFolders] = useState(false);
  const [showSubFolders, setShowSubFolders] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchFoldersandFiles = async () => {
  //     setLoading(true);
  //     try {
  //       const fetchedFolders = await getAllFolders(clientOrganizationId);
  //       setMainFolders(fetchedFolders);
  //       const fetchedFiles = await getFilesWithoutFolder(clientOrganizationId);
  //       setMainFiles(fetchedFiles);
  //     } catch (error) {
  //       console.error('Error fetching folders:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFoldersandFiles().catch((error) => console.error('Error fetching folders:', error));
  // }, [clientOrganizationId]);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        let fetchedFiles;
        if (selectedOption === 'all') {
          const fetchedFolders = await getAllFolders(clientOrganizationId);
          setMainFolders(fetchedFolders);
          fetchedFiles = await getFilesWithoutFolder(clientOrganizationId);
        } else if (selectedOption === 'team_uploaded') {
          fetchedFiles = await getMemberFiles(clientOrganizationId);
        } else if (selectedOption === 'client_uploaded') {
          fetchedFiles = await getClientFiles(clientOrganizationId);
        }
        setMainFiles(fetchedFiles ?? []);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFiles().catch((error) => console.error('Error fetching files:', error));
  }, [clientOrganizationId, selectedOption]); // Ahora depende de `selectedOption`
  

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleFolderClick = async (folderUuid: string, folderTitle: string, isOrderFolder = false) => {
    setLoading(true);
    try {
      if (folderUuid === '' && isOrderFolder) {
        setCurrentPath([]); 
        setPath([]);        
        setShowFolders(false);
        setShowSubFolders(false);
        setFolders([]);
        setFiles([]);
        setSubFolders([]);
        setCurrentPath([{ title: folderTitle }]); 
        setPath([{ title: folderTitle }]);
        setShowSubFolders(false);
        setSubFolders([]);
      
        const fetchedOrderFolders = await getOrdersFolders(clientOrganizationId);
        setFolders(fetchedOrderFolders);
        setShowFolders(true);
        
      }else if (folderUuid && isOrderFolder) {
        setShowFolders(false);
        setShowSubFolders(false);
        setFolders([]);
        setFiles([]);
        setSubFolders([]);
        setShowSubFolders(false);
        setSubFolders([]);
        setFiles([]);
        
        setShowFolders(true); 

        setCurrentPath(prevPath => {
          if (isOrderFolder) {
            return [...prevPath, { title: folderTitle, uuid: folderUuid }];
          } else {
            return [{ title: folderTitle, uuid: folderUuid }];
          }
        });
  
        setPath(prevPath => {
          if (isOrderFolder) {
            return [...prevPath, { title: folderTitle, uuid: folderUuid }];
          } else {
            return [{ title: folderTitle, uuid: folderUuid }];
          }
        });
  
        // Fetch files and subfolders for the specific folder
        const fetchedFiles = await getFilesByFolder(folderUuid);
        setFiles(fetchedFiles);
  
        const fetchedSubFolders = await getFoldersByFolder(folderUuid);
        setShowSubFolders(fetchedSubFolders.length > 0);
        setSubFolders(fetchedSubFolders.map(folder => ({ title: folder.name, uuid: folder.id })));
      } else if (folderUuid) {
        setShowFolders(false);
        setShowSubFolders(false);
        setFolders([]);
        setFiles([]);
        setSubFolders([]);
        setShowSubFolders(false);
        setSubFolders([]);
        setFiles([]);
        
        setShowFolders(true); 

        setCurrentPath(prevPath => {
          if (isOrderFolder) {
            return [...prevPath, { title: folderTitle, uuid: folderUuid }];
          } else {
            return [{ title: folderTitle, uuid: folderUuid }];
          }
        });
  
        setPath(prevPath => {
          if (isOrderFolder) {
            return [...prevPath, { title: folderTitle, uuid: folderUuid }];
          } else {
            return [{ title: folderTitle, uuid: folderUuid }];
          }
        });
  
        // Fetch files and subfolders for the specific folder
        const fetchedFiles = await getFilesByFolder(folderUuid);
        setFiles(fetchedFiles);
  
        const fetchedSubFolders = await getFoldersByFolder(folderUuid);
        setShowSubFolders(fetchedSubFolders.length > 0);
        setSubFolders(fetchedSubFolders.map(folder => ({ title: folder.name, uuid: folder.id })));
      } else {
        setCurrentPath([]); 
        setPath([]);        
        setShowFolders(false);
        setShowSubFolders(false);
        setFolders([]);
        setFiles([]);
        setSubFolders([]);
        

        const fetchedFolders = await getAllFolders(clientOrganizationId);
        setFolders(fetchedFolders); 
      }
    } catch (error) {
      console.error('Error fetching files or folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePathClick = async (index: number) => {
    if (index === -1) {
      setPath([]); 
      setCurrentPath([]); 
      setShowFolders(false);
      setShowSubFolders(false);
      setFolders([]); 
      setFiles([]);   
      setSubFolders([]); 
      
      const fetchedFolders = await getAllFolders(clientOrganizationId);
      setFolders(fetchedFolders); 
    } else {
      const newPath = path.slice(0, index + 1); 
      setPath(newPath);
      setCurrentPath(newPath); 
  
      const folderUuid = newPath[newPath.length - 1]?.uuid;
  
      if (folderUuid) {
        setLoading(true);
        try {
          const fetchedFiles = await getFilesByFolder(folderUuid);
          setFiles(fetchedFiles);
  
          const fetchedSubFolders = await getFoldersByFolder(folderUuid);
          setShowSubFolders(fetchedSubFolders.length > 0);
          setSubFolders(fetchedSubFolders.map(folder => ({ title: folder.name, uuid: folder.id })));
        } catch (error) {
          console.error('Error fetching files or folders:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          setFiles([]);
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
  
  const options = [
    { value: 'all', label: t('files.all') },
    { value: 'team_uploaded', label: t('files.team_uploaded') },
    { value: 'client_uploaded', label: t('files.client_uploaded') },
  ];

  const renderBreadcrumbs = () => (
    <div className='text-gray-700 text-[14px] mb-2'>
      <span className="cursor-pointer" onClick={() => handlePathClick(-1)}>
        {'...'}
      </span>
      {path.map((folder, index) => {
        const isCurrentFolder = index === path.length - 1;
        return (
          <span
            key={folder.uuid}
            className={isCurrentFolder ? 'text-gray-500 cursor-default' : 'cursor-pointer'}
            onClick={() => !isCurrentFolder && handlePathClick(index)}
          >
            {' > '}{folder.title}
          </span>
        );
      })}
    </div>
  );
  
  return (
    <div>
      <div className='flex justify-between mb-[32px]'>
        <RadioOptions options={options} selectedOption={selectedOption} onChange={handleOptionChange} />
      </div>

      {selectedOption === 'all' && (
        <>
          {path.length > 0 &&  renderBreadcrumbs()}

          {loading ? (
            <div className="flex items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-gray-500 dark:text-white" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {!showFolders && (
                <div className='mt-4 flex flex-wrap gap-8'>
                  <FolderItem 
                    folder={{ title: t('files.orders'), id: '' }} 
                    onClick={() => handleFolderClick('', t('files.orders'), true)} 
                    isOrderFolder = {true}
                  />
                  {mainFolders.map(folder => (
                    <FolderItem 
                      key={folder.uuid} 
                      folder={{ title: folder.title ?? '', id: folder.uuid }} 
                      onClick={() => handleFolderClick(folder.uuid, folder.title ?? '', false)} 
                      isOrderFolder = {false}
                    />
                  ))}
                  {mainFiles.map(file => (
                    <FileItem key={file.id} file={file} />
                  ))}
                </div>
              )}

              {showFolders && files.length === 0 && !showSubFolders &&(
                <div>
                  <div className='mt-4 flex gap-8'>
                    {folders.map(folder => (
                      <FolderItem 
                        key={folder.uuid} 
                        folder={{ title: folder.title ?? '', id: folder.uuid }} 
                        onClick={() => handleFolderClick(folder.uuid, folder.title ?? '', true)} 
                        isOrderFolder = {true}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className='flex flex-wrap gap-8'>
                {showSubFolders && (
                  <div>
                    <div className='mt-4 flex flex-wrap gap-8'>
                      {subFolders.map(folder => (
                        <FolderItem 
                          key={folder.uuid} 
                          folder={{ title: folder.title ?? '', id: folder.uuid }} 
                          onClick={() => handleFolderClick(folder.uuid, folder.title ?? '', true)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
                {files.length > 0 && (
                  <div>
                    
                    <div className='mt-4 flex flex-wrap gap-8'>
                      {files.map(file => (
                        <FileItem key={file.id} file={file} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {selectedOption === 'team_uploaded' && (
        <>
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-gray-500 dark:text-white" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        ): (
          <>
          <div>
            {t('files.team_uploaded')}
            {mainFiles.length > 0 && (
              <div>
                <div className='mt-4 flex flex-wrap gap-8'>
                  {mainFiles.map(file => (
                    <FileItem key={file.id} file={file} />
                  ))}
                </div>
              </div>
            )}
          </div>
          </>
        )}
        </>
      )}

      {selectedOption === 'client_uploaded' && (
        <>
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-gray-500 dark:text-white" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        ): (
          <>
          <div>
            {t('files.client_uploaded')}
            {mainFiles.length > 0 && (
              <div>
                <div className='mt-4 flex flex-wrap gap-8'>
                  {mainFiles.map(file => (
                    <FileItem key={file.id} file={file} />
                  ))}
                </div>
              </div>
            )}
          </div>
          </>
        )}
        </>
      )}
    </div>
  );
};

export default FileSection;

