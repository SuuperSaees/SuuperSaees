'use client';

import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import Breadcrumb from '../../app/components/shared/breadcrumb';
import EmptyState from '../ui/empty-state';
import { SkeletonCards } from '../ui/skeleton';
import FileItem from './files/file-item';
import FolderItem from './files/folder-item';
import {
  FolderItem as FolderItemType,
  useFileManagement,
} from './files/hooks/use-folder-manager';
import { OptionFiles } from './files/option-files';
// import RadioOptions from './files/radio-options';
import { SkeletonCardFile } from './skeleton-card-file';

interface FileSectionProps {
  clientOrganizationId: string;
  agencyId: string;
  setCurrentPath?: React.Dispatch<React.SetStateAction<Array<FolderItemType>>>;
  currentPath?: Array<FolderItemType>;
}

export default function FileSection({
  clientOrganizationId,
  agencyId,
  setCurrentPath,
  currentPath,
}: FileSectionProps) {
  const { workspace: userWorkspace } = useUserWorkspace();
  const { t } = useTranslation('organizations');
  const {
    selectedOption,
    // setSelectedOption,
    currentFolders,
    currentFiles,
    folderItems,
    loading,
    handleFolderClick,
    handlePathClick,
    queryKey,
    currentFolderId
  } = useFileManagement(
    clientOrganizationId,
    agencyId,
    setCurrentPath,
    currentPath,
  );

  // const options = [
  //   { value: 'all', label: t('organizations:files.all') },
  //   { value: 'team_uploaded', label: t('organizations:files.team_uploaded') },
  //   { value: 'client_uploaded', label: t('organizations:files.client_uploaded') },
  // ]

  if (loading) {
    return (
      <SkeletonCards count={7} className="mt-4 flex flex-wrap gap-8">
        <SkeletonCardFile
          className="h-[170px] w-[184px]"
          classNameBox="h-[132px] w-[184px]"
          classNameLineText="h-[16px] w-14"
        />
      </SkeletonCards>
    );
  }

  const renderContent = () => {
    // Subfolder or empty folder
    const hasContent = currentFolders.length > 0 || currentFiles.length > 0;
    return (
      <div className="mt-4 flex flex-wrap gap-8">
        {currentFolders.map((folder) => (
          <FolderItem
            key={folder.uuid}
            folder={{ title: folder.title ?? '', id: folder.uuid }}
            onClick={() => handleFolderClick(folder.uuid, folder.title ?? '')}
            queryKey={queryKey}
          />
        ))}
        {currentFiles.map((file) => (
          <FileItem key={file.id} file={file} currentFolders={folderItems} />
        ))}
        {!hasContent && (
          <EmptyState
            title={t('organizations:files.emptyFolder')}
            description={t('organizations:files.emptyFolderDescription')}
            imageSrc="/images/illustrations/Illustration-files.svg"
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between">
        {folderItems.length > 0 && selectedOption === 'all' && (
          <Breadcrumb items={folderItems} handlePathClick={handlePathClick} />
        )}
        {/* <RadioOptions
          options={options}
          selectedOption={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        /> */}
        {selectedOption === 'all' && (
          <div className="ml-auto flex-shrink-0">
            <OptionFiles
              clientOrganizationId={clientOrganizationId}
              currentFolders={folderItems}
              currentFolderId={currentFolderId}
              queryKey={queryKey}
              userId={userWorkspace.id ?? ''}
              agencyId={agencyId}
            />
          </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
}
