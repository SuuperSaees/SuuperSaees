import { loadUserWorkspace } from '../home/(user)/_lib/server/load-user-workspace';
import { getOrganizationSettingsByOrganizationId } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';
import { OrganizationSettings } from '~/lib/organization-settings.types';
import { redirect } from 'next/navigation';
import pathsConfig from '~/config/paths.config';

export default async function PartnersPage() {
  const { organization, agency, workspace } = await loadUserWorkspace();

  const organizationSettings = await getOrganizationSettingsByOrganizationId(agency ? agency.id : organization?.id ?? '', true, ['parteners_url']).catch((err) => {
    console.error(`Error client, getting organization settings: ${err}`)
    return []
  });

  const partenersUrl = organizationSettings?.find((setting) => setting.key === OrganizationSettings.KEYS.parteners_url)?.value;

  if (!partenersUrl) {
    return redirect(pathsConfig.app.orders);
  }

  const clientRoles = new Set(['client_owner', 'client_member']);
  const urlHasUserIds = partenersUrl.includes('userIds=');
  if (urlHasUserIds && clientRoles.has(workspace.role ?? '')) {
    const userIds = new URL(partenersUrl).searchParams.get('userIds')?.split(',') ?? [];
    if (!userIds.includes(workspace.id ?? '')) {
      return redirect(pathsConfig.app.orders);
    }
  }

  return (
      <div className="flex h-full border-t">
        <iframe src={partenersUrl} className="w-full h-full" />
      </div>
  );
}
