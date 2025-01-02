'use client';

import { useState } from 'react';
import FileSection from '~/components/organization/files';
// import { OptionFiles } from '~/components/organization/files/option-files';

function FilesView({
  clientOrganizationId,
  agencyId
}: {
  clientOrganizationId: string;
  agencyId: string;
}) {
  const [currentPath, setCurrentPath] = useState<{ title: string; uuid?: string }[]>([]);

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
        setCurrentPath={setCurrentPath}
      />
    </>
  );
}

export default FilesView;