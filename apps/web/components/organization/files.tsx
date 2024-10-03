'use client';

import { useTranslation } from 'react-i18next';

import FileItem from './files/file-item';
import FolderItem from './files/folder-item';
import { useFileManagement } from './files/hooks/use-folder-manager';
import { OptionFiles } from './files/option-files';
import RadioOptions from './files/radio-options';

// import React, { useEffect } from 'react';

interface FileSectionProps {
  clientOrganizationId: string;
  setCurrentPath?: React.Dispatch<
    React.SetStateAction<Array<{ title: string; uuid?: string }>>
  >;
  currentPath?: Array<{ title: string; uuid?: string }>;
}

const FileSection: React.FC<FileSectionProps> = ({
  clientOrganizationId,
  setCurrentPath,
  currentPath,
}) => {
  const { t } = useTranslation();
  const {
    selectedOption,
    setSelectedOption,
    mainFolders,
    mainFiles,
    folders,
    subFolders,
    files,
    path,
    loading,
    handleFolderClick,
    handlePathClick,
    currentFolderType,
  } = useFileManagement(clientOrganizationId, setCurrentPath, currentPath);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const renderBreadcrumbs = () => (
    <div className="mb-2 text-[14px] text-gray-700">
      <span className="cursor-pointer" onClick={() => handlePathClick(-1)}>
        {'...'}
      </span>
      {path.map((folder, index) => (
        <span key={folder.uuid ?? index}>
          {' > '}
          <span
            className={
              index === path.length - 1
                ? 'cursor-default text-gray-500'
                : 'cursor-pointer'
            }
            onClick={() => index !== path.length - 1 && handlePathClick(index)}
          >
            {folder.title}
          </span>
        </span>
      ))}
    </div>
  );

  const options = [
    { value: 'all', label: t('organizations:files.all') },
    { value: 'team_uploaded', label: t('organizations:files.team_uploaded') },
    {
      value: 'client_uploaded',
      label: t('organizations:files.client_uploaded'),
    },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-gray-500 dark:text-white"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      );
    }

    if (path.length === 0) {
      return (
        <div className="mt-4 flex flex-wrap gap-8">
          <FolderItem
            folder={{ title: t('organizations:files.orders'), id: '' }}
            onClick={() =>
              handleFolderClick('', t('organizations:files.orders'), true)
            }
            isOrderFolder={true}
          />
          {mainFolders.map((folder) => (
            <FolderItem
              key={folder.uuid}
              folder={{ title: folder.title ?? '', id: folder.uuid }}
              onClick={() =>
                handleFolderClick(folder.uuid, folder.title ?? '', false)
              }
              isOrderFolder={false}
            />
          ))}
          {mainFiles.map((file) => (
            <FileItem key={file.id} file={file} />
          ))}
        </div>
      );
    }

    if (currentFolderType === 'orders' && folders.length > 0) {
      return (
        <div className="mt-4 flex flex-wrap gap-8">
          {folders.map((folder) => (
            <FolderItem
              key={folder.uuid}
              folder={{ title: folder.title ?? '', id: folder.uuid }}
              onClick={() =>
                handleFolderClick(folder.uuid, folder.title ?? '', true)
              }
              isOrderFolder={true}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="mt-4 flex flex-wrap gap-8">
        {subFolders.map((folder) => (
          <FolderItem
            key={folder.uuid}
            folder={{ title: folder.title ?? '', id: folder.uuid }}
            onClick={() =>
              handleFolderClick(
                folder.uuid,
                folder.title ?? '',
                currentFolderType === 'orders',
              )
            }
          />
        ))}
        {files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    );
  };

  const renderClientAndTeamMemberContent = () => {
    if (loading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-gray-500 dark:text-white"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 flex flex-wrap gap-8">
        {mainFiles.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between">
        <RadioOptions
          options={options}
          selectedOption={selectedOption}
          onChange={handleOptionChange}
        />
        {selectedOption === 'all' && (
          <OptionFiles
            clientOrganizationId={clientOrganizationId}
            currentPath={path ?? []}
          />
        )}
      </div>

      {path.length > 0 && selectedOption === 'all' && renderBreadcrumbs()}

      {selectedOption === 'all' && renderContent()}

      {(selectedOption === 'team_uploaded' ||
        selectedOption === 'client_uploaded') &&
        renderClientAndTeamMemberContent()}
    </div>
  );
};

export default FileSection;
