'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioOption } from './files/filter-option-files';
import { getAllFolders, getOrdersFolders, getFilesByFolder, getFilesWithoutFolder } from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import FolderItem from './files/folder-item';
import FileItem from './files/file-item';

interface RadioOptionsProps {
  options: { value: string; label: string }[];
  selectedOption: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioOptions: React.FC<RadioOptionsProps> = ({ options, selectedOption, onChange }) => (
  <div className="flex gap-4 items-center">
    {options.map(option => (
      <RadioOption
        key={option.value}
        value={option.value}
        selectedOption={selectedOption}
        onChange={onChange}
        label={option.label}
      />
    ))}
  </div>
);

interface FileSectionProps {
  clientOrganizationId: string;
}

const FileSection: React.FC<FileSectionProps> = ({ clientOrganizationId }) => {
  const { t } = useTranslation('organizations');
  const [selectedOption, setSelectedOption] = useState('all');
  const [mainFolders, setMainFolders] = useState<Array<{ title: string | null; uuid: string }>>([]);
  const [mainFiles, setMainFiles] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
  const [folders, setFolders] = useState<Array<{ title: string | null; uuid: string }>>([]);
  const [files, setFiles] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
  const [path, setPath] = useState<Array<{ title: string; uuid?: string }>>([]);
  const [showFolders, setShowFolders] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoldersandFiles = async () => {
      setLoading(true);
      try {
        const fetchedFolders = await getAllFolders(clientOrganizationId);
        setMainFolders(fetchedFolders);
        const fetchedFiles = await getFilesWithoutFolder(clientOrganizationId);
        setMainFiles(fetchedFiles);
      } catch (error) {
        console.error('Error fetching folders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoldersandFiles().catch((error) => console.error('Error fetching folders:', error));
  }, [clientOrganizationId]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleFolderClick = async (folderUuid: string, folderTitle: string, isOrderFolder = false) => {
    setLoading(true);
    try {
      setFolders([]);
      setFiles([]);
      
      if (folderUuid) {
        setPath(prevPath => {
          if (isOrderFolder) {
            return [...prevPath, { title: folderTitle, uuid: folderUuid }];
          } else {
            return [{ title: folderTitle, uuid: folderUuid }];
          }
        });
  
        // Fetch files for the selected folder
        const fetchedFiles = await getFilesByFolder(folderUuid);
        setFiles(fetchedFiles);
        setShowFolders(true);
      } else {
        // Handle the case where it's the root "Orders" folder
        setPath([{ title: t('files.orders') }]);
        setShowFolders(!showFolders);
  
        // Fetch folders within the Orders section
        const fetchedOrderFolders = await getOrdersFolders(clientOrganizationId);
        setFolders(fetchedOrderFolders);
      }
    } catch (error) {
      console.error('Error fetching files or folders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePathClick = async (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    if (newPath.length > 1) {
      const folderUuid = newPath[newPath.length - 1]?.uuid;
      if (folderUuid) {
        setLoading(true);
        try {
          const fetchedFiles = await getFilesByFolder(folderUuid);
          setFiles(fetchedFiles);
          setShowFolders(true);
        } catch (error) {
          console.error('Error fetching files:', error);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setFiles([]);
      setShowFolders(false);
    }
  };

  const options = [
    { value: 'all', label: t('files.all') },
    { value: 'team_uploaded', label: t('files.team_uploaded') },
    { value: 'client_uploaded', label: t('files.client_uploaded') },
  ];

  const renderBreadcrumbs = () => (
    <div className='text-gray-700 text-[14px] mb-2'>
      {path.map((folder, index) => (
        <span key={folder.uuid} className="cursor-pointer" onClick={() => handlePathClick(index)}>
          {folder.title}{index < path.length - 1 && " > "}
        </span>
      ))}
    </div>
  );

  return (
    <div>
      <div className='flex justify-between mb-[32px]'>
        <RadioOptions options={options} selectedOption={selectedOption} onChange={handleOptionChange} />
      </div>

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
                folder={{ title: t('files.orders') }} 
                onClick={() => handleFolderClick('', t('files.orders'), true)} 
              />
              {mainFolders.map(folder => (
                <FolderItem 
                  key={folder.uuid} 
                  folder={{ title: folder.title ?? ''}} 
                  onClick={() => handleFolderClick(folder.uuid, folder.title ?? '', false)} 
                />
              ))}
              {mainFiles.map(file => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          )}

          {showFolders && files.length === 0 && (
            <div>
              {renderBreadcrumbs()}
              <div className='mt-4 flex gap-8'>
                {folders.map(folder => (
                  <FolderItem key={folder.uuid} folder={{ title: folder.title ?? ''}} onClick={() => handleFolderClick(folder.uuid, folder.title ?? '', true)} />
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              {renderBreadcrumbs()}
              <div className='mt-4 flex flex-wrap gap-20'>
                {files.map(file => (
                  <FileItem key={file.id} file={file} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileSection;
