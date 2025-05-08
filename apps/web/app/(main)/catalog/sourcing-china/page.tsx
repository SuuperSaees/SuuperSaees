import { loadUserWorkspace } from '~/(main)/home/(user)/_lib/server/load-user-workspace';
import { getOrganizationSettingsByOrganizationId } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';
import { OrganizationSettings } from '~/lib/organization-settings.types';
import { redirect } from 'next/navigation';
import pathsConfig from '~/config/paths.config';

export default async function SourcingChinaPage() {
  const { organization, agency, workspace } = await loadUserWorkspace();

  const organizationSettings = await getOrganizationSettingsByOrganizationId(agency ? agency.id : organization?.id ?? '', true, ['catalog_sourcing_china_url']).catch((err) => {
    console.error(`Error client, getting organization settings: ${err}`)
    return []
  });

  const sourcingChinaUrl = organizationSettings?.find((setting) => setting.key === OrganizationSettings.KEYS.catalog_sourcing_china_url)?.value;

  if (!sourcingChinaUrl) {
    return redirect(pathsConfig.app.orders);
  }

  const clientRoles = new Set(['client_owner', 'client_member']);
  const urlHasUserIds = sourcingChinaUrl.includes('userIds=');
  if (urlHasUserIds && clientRoles.has(workspace.role ?? '')) {
    const userIds = new URL(sourcingChinaUrl).searchParams.get('userIds')?.split(',') ?? [];
    if (!userIds.includes(workspace.id ?? '')) {
      return redirect(pathsConfig.app.orders);
    }
  }

  return (
      <div className="flex h-full border-t">
        <iframe src={sourcingChinaUrl} className="w-full h-full" />
      </div>
  );
}
