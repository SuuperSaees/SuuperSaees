'use client';

import FileSection from '~/components/organization/files';
import { FolderItem } from '~/components/organization/files/hooks/use-folder-manager';
// import { OptionFiles } from '~/components/organization/files/option-files';

function FilesView({
  clientOrganizationId,
  agencyId,
  organizationName
}: {
  clientOrganizationId: string;
  agencyId: string;
  organizationName: string;
}) {
  const currentPath: FolderItem[] = [
    {
      id: clientOrganizationId ?? agencyId,
      title: organizationName
    }
  ]

  return (  
    <>
    {/* <div className='flex justify-end'>
      <OptionFiles
        clientOrganizationId={clientOrganizationId}
        currentPath={currentPath}
      />
    </div> */}
      <FileSection
        key={'files'}
        clientOrganizationId={clientOrganizationId}
        agencyId={agencyId}
        currentPath={currentPath}
      />
    </>
  );
}

export default FilesView;