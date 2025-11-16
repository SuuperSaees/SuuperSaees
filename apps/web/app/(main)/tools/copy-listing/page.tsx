'use client'

import { redirect } from 'next/navigation';
import pathsConfig from '~/config/paths.config';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

export default function CopyListingPage() {
  const { tool_copy_list_url } = useOrganizationSettings()

  if (!tool_copy_list_url) {
    return redirect(pathsConfig.app.orders);
  }

  return (
      <div className="flex h-full border-t">
        <iframe src={tool_copy_list_url} className="w-full h-full" />
      </div>
  );
}
